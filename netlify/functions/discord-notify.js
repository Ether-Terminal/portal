// Netlify Serverless Function: Secure Discord Webhook Relay
// Relays webhook notifications using server-side environment variable: DISCORD_WEBHOOK_URL
// Keeps credentials 100% hidden and off the public client-side bundle.

const https = require("https");
const { URL } = require("url");

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

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        // Silently succeed with notice if webhook is not configured yet
        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ status: "ignored", message: "DISCORD_WEBHOOK_URL is not configured in server environment" })
        };
    }

    try {
        const payload = JSON.parse(event.body || "{}");
        const result = await postWebhook(webhookUrl, payload);

        return {
            statusCode: result.statusCode >= 200 && result.statusCode < 300 ? 200 : result.statusCode,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ success: result.statusCode >= 200 && result.statusCode < 300 })
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Failed to relay webhook: " + err.message })
        };
    }
};
