// Netlify Serverless Function: Secure Anonymous Webhook & Push Notification Relay
// ZERO CLIENT EXPOSURE: All URLs and topics are managed server-side.
// Supports:
// 1. Anonymous zero-account push notifications via ntfy.sh (phone / desktop)
// 2. Encrypted Discord webhook relay (when DISCORD_WEBHOOK_URL is configured in Netlify environment variables)

const https = require("https");
const { URL } = require("url");

// Secure default anonymous topic (can be overridden via Netlify NTFY_TOPIC environment variable)
const DEFAULT_NTFY_TOPIC = "ether-ops-sovereign-leads-7a91";

function postWebhook(targetUrl, payload) {
    return new Promise((resolve, reject) => {
        try {
            const urlObj = new URL(targetUrl);
            const data = JSON.stringify(payload);

            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || 443,
                path: urlObj.pathname + urlObj.search,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(data),
                    "User-Agent": "Ether-Terminal-Relay/1.0"
                }
            };

            const req = https.request(options, (res) => {
                let responseBody = "";
                res.on("data", (chunk) => { responseBody += chunk; });
                res.on("end", () => {
                    resolve({ statusCode: res.statusCode, body: responseBody });
                });
            });

            req.on("error", (err) => reject(err));
            req.setTimeout(8000, () => { req.destroy(new Error("Discord relay timed out")); });
            req.write(data);
            req.end();
        } catch (e) {
            reject(e);
        }
    });
}

function postNtfy(topic, title, message, actionUrl) {
    return new Promise((resolve, reject) => {
        try {
            const data = Buffer.from(message, "utf8");
            // Ensure ASCII-only for HTTP header compliance
            const safeTitle = (title || "Ether Terminal Alert").replace(/[^\x20-\x7E]/g, "").trim();

            const headers = {
                "Title": safeTitle || "Ether Terminal Alert",
                "Priority": "urgent",
                "Tags": "zap,briefcase,dollar",
                "Content-Length": data.length,
                "User-Agent": "Ether-Terminal-Relay/1.0"
            };

            if (actionUrl) {
                headers["Actions"] = `view, Open Directive, ${actionUrl}`;
            }

            const req = https.request({
                hostname: "ntfy.sh",
                port: 443,
                path: `/${encodeURIComponent(topic)}`,
                method: "POST",
                headers: headers
            }, (res) => {
                let responseBody = "";
                res.on("data", (chunk) => { responseBody += chunk; });
                res.on("end", () => {
                    resolve({ statusCode: res.statusCode, body: responseBody });
                });
            });

            req.on("error", (err) => reject(err));
            req.setTimeout(8000, () => { req.destroy(new Error("Ntfy relay timed out")); });
            req.write(data);
            req.end();
        } catch (e) {
            reject(e);
        }
    });
}

function postResendEmail(apiKey, fromEmail, toEmails, subject, htmlContent, textContent, bccEmails) {
    return new Promise((resolve, reject) => {
        try {
            const emailPayload = {
                from: fromEmail || "Ether Terminal Operations <directives@ether-terminal.com>",
                to: Array.isArray(toEmails) ? toEmails : [toEmails],
                subject: subject || "⚡ [ETHER DIRECTIVE] Official Notice",
                html: htmlContent,
                text: textContent
            };
            if (bccEmails && bccEmails.length > 0) {
                emailPayload.bcc = Array.isArray(bccEmails) ? bccEmails : [bccEmails];
            }
            const data = JSON.stringify(emailPayload);

            const options = {
                hostname: "api.resend.com",
                port: 443,
                path: "/emails",
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(data),
                    "User-Agent": "Ether-Terminal-Relay/1.0"
                }
            };

            const req = https.request(options, (res) => {
                let responseBody = "";
                res.on("data", (chunk) => { responseBody += chunk; });
                res.on("end", () => {
                    resolve({ statusCode: res.statusCode, body: responseBody });
                });
            });

            req.on("error", (err) => reject(err));
            req.setTimeout(8000, () => { req.destroy(new Error("Resend relay timed out")); });
            req.write(data);
            req.end();
        } catch (e) {
            reject(e);
        }
    });
}

exports.handler = async function(event, context) {
    // Handle CORS preflight
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            body: ""
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Method Not Allowed" })
        };
    }

    let payload = {};
    try {
        payload = JSON.parse(event.body || "{}");
    } catch (e) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Invalid JSON body" })
        };
    }

    // 1. Extract clean plain text for Push Notifications
    let title = "Ether Terminal Alert";
    let lines = [];
    let actionUrl = null;

    if (payload.embeds && Array.isArray(payload.embeds) && payload.embeds.length > 0) {
        const emb = payload.embeds[0];
        if (emb.title) title = emb.title.replace(/[*_~`]/g, "");
        if (emb.description) lines.push(emb.description.replace(/[*_~`]/g, ""));
        if (emb.fields && Array.isArray(emb.fields)) {
            for (const f of emb.fields) {
                const rawVal = f.value || "";
                const linkMatch = rawVal.match(/\((https?:\/\/[^\s)]+)\)/);
                if (linkMatch && !actionUrl) {
                    actionUrl = linkMatch[1];
                }
                const cleanVal = rawVal.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/[*_~`]/g, "").trim();
                lines.push(`• ${f.name.replace(/[*_~`]/g, "")}: ${cleanVal}`);
            }
        }
    } else if (payload.content) {
        lines.push(payload.content);
    } else {
        lines.push("New operational notification received.");
    }

    const ntfyMessage = lines.join("\n");
    const ntfyTopic = process.env.NTFY_TOPIC || DEFAULT_NTFY_TOPIC;
    const discordUrl = process.env.DISCORD_WEBHOOK_URL;

    const results = {
        ntfy: false,
        discord: false,
        email: false
    };

    // 2. Dispatch to Anonymous Ntfy Channel
    try {
        const ntfyRes = await postNtfy(ntfyTopic, title, ntfyMessage, actionUrl);
        results.ntfy = ntfyRes.statusCode >= 200 && ntfyRes.statusCode < 300;
    } catch (err) {
        console.error("Ntfy dispatch error:", err.message);
    }

    // 3. Dispatch to Discord if configured
    if (discordUrl) {
        try {
            // Ensure payload includes mention and allowed_mentions so Discord sends push notifications to mobile
            if (!payload.content) {
                payload.content = "⚡ **[OPERATIONS DISPATCH]** " + title + " @everyone";
            } else if (!payload.content.includes("@everyone") && !payload.content.includes("@here")) {
                payload.content = payload.content + " @everyone";
            }
            if (!payload.allowed_mentions) {
                payload.allowed_mentions = { parse: ["everyone"] };
            }
            const discordRes = await postWebhook(discordUrl, payload);
            results.discord = discordRes.statusCode >= 200 && discordRes.statusCode < 300;
        } catch (err) {
            console.error("Discord dispatch error:", err.message);
        }
    }

    // 4. Dispatch Email via Resend if RESEND_API_KEY is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
        try {
            const fromEmail = process.env.RESEND_FROM_EMAIL || "Ether Terminal Directives <directives@ether-terminal.com>";
            const recipientConfig = process.env.NOTIFY_EMAIL || "etherterminal@proton.me";

            let fieldRowsHtml = "";
            if (payload.embeds && payload.embeds[0] && payload.embeds[0].fields) {
                fieldRowsHtml = payload.embeds[0].fields.map(f => {
                    const rawVal = f.value || "";
                    const linkMatch = rawVal.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
                    let displayVal = rawVal;
                    if (linkMatch) {
                        displayVal = `<a href="${linkMatch[2]}" style="color:#002244; font-weight:bold; text-decoration:underline;">${linkMatch[1]}</a>`;
                    }
                    return `
                        <tr>
                            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-size: 11px; color: #64748b; width: 140px; text-transform: uppercase;">${f.name}</td>
                            <td style="padding: 10px 14px; border-bottom: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 600; color: #0f172a;">${displayVal}</td>
                        </tr>
                    `;
                }).join("");
            }

            const emailSubject = `⚡ [DIRECTIVE RATIFIED] ${title.replace(/[^\x20-\x7E]/g, "").trim()}`;
            const htmlBody = `
                <div style="background-color: #f1f5f9; padding: 30px 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border: 4px double #b8860b; padding: 30px 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                        <div style="text-align: center; border-bottom: 2px solid #002244; padding-bottom: 16px; margin-bottom: 20px;">
                            <div style="font-size: 11px; letter-spacing: 2px; color: #b8860b; font-weight: bold; font-family: monospace;">PRESIDENTIAL DIRECTIVE &amp; SETTLEMENT MEMORANDUM</div>
                            <h1 style="margin: 6px 0 0 0; color: #002244; font-size: 20px; font-family: Georgia, serif; letter-spacing: 1px;">ETHER TERMINAL LLC</h1>
                        </div>

                        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; margin-bottom: 20px; font-family: monospace; font-size: 12px; color: #166534;">
                            <b>RATIFICATION SEALED:</b> An executive buyer has rendered their signature and unconditionally ratified the Master Sovereign License and Non-Recourse Covenant.
                        </div>

                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px; background: #fafaf9; border: 1px solid #e2e8f0; border-radius: 4px;">
                            ${fieldRowsHtml}
                        </table>

                        <div style="background: #f8fafc; border: 1.5px solid #002244; padding: 16px; margin-bottom: 24px; font-family: monospace; font-size: 12px; line-height: 1.6;">
                            <div style="color: #002244; font-weight: bold; border-bottom: 1px dotted #cbd5e1; padding-bottom: 6px; margin-bottom: 8px;">
                                FEDWIRE &amp; ACH TREASURY CLEARANCE COORDINATES:
                            </div>
                            <div>• Beneficiary: <b>Ether Terminal LLC</b></div>
                            <div>• Receiving Bank: <b>Client Designated Commercial Bank</b></div>
                            <div>• Fedwire / ACH Routing (ABA): <b style="color:#002244;">211370150</b></div>
                            <div>• Account Number: <b style="color:#002244;">•••••••• [RELEASED TO AP DESK]</b></div>
                            <div>• Protocol Treasury Desk: <b>contact@ether-terminal.com</b></div>
                        </div>

                        ${actionUrl ? `
                        <div style="text-align: center; margin: 26px 0;">
                            <a href="${actionUrl}" style="background: #002244; color: #d4af37; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 13px; letter-spacing: 1px;">
                                OPEN RATIFIED DOSSIER IN PROTOCOL ENCLAVE →
                            </a>
                        </div>` : ''}

                        <div style="border-top: 1px solid #e2e8f0; margin-top: 24px; padding-top: 14px; text-align: center; font-size: 10px; color: #94a3b8; font-family: monospace;">
                            Ether Terminal LLC • Sovereign Cryptographic Enclave • Bilaterally Sealed &amp; Bound
                        </div>
                    </div>
                </div>
            `;

            const recipients = recipientConfig.split(",").map(e => e.trim()).filter(Boolean);
            const bccEmail = process.env.BACKUP_NOTIFY_EMAIL ? [process.env.BACKUP_NOTIFY_EMAIL.trim()] : null;
            const emailRes = await postResendEmail(resendApiKey, fromEmail, recipients, emailSubject, htmlBody, ntfyMessage, bccEmail);
            results.email = emailRes.statusCode >= 200 && emailRes.statusCode < 300;
        } catch (err) {
            console.error("Resend dispatch error:", err.message);
        }
    }

    return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
            success: true,
            status: "dispatched",
            channels: results
        })
    };
};
