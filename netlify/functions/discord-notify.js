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
        discord: false
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
