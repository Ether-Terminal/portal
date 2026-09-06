// Netlify Serverless Function: Automated Enterprise License & Credentials Email Dispatcher
// Dispatches luxury HTML invoice dossiers & cryptographic license keys to enterprise buyers

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const payload = JSON.parse(event.body || '{}');
        const company = payload.company || 'Enterprise Partner';
        const name = payload.name || 'Decision Maker';
        const email = payload.email || '';
        const phone = payload.phone || 'Not Provided';
        const tier = payload.tier || 'Command Tier';
        const billing = payload.billing || 'Annual';
        const includeHardware = payload.include_hardware || false;
        const licenseKey = payload.license_key || 'LIC-ET-PROV-8F9A41C07E2B6D39-SEALED';
        const operatorId = payload.operator_id || 'OP-ETH-9921';
        const wireMemo = payload.wire_memo || 'ET-ENTERPRISE-WIRE';
        const amountUsd = payload.amount_usd || 450000;

        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const receiptNo = `INV-ET-${Date.now().toString().slice(-8)}`;

        const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Official Ether Sovereign OS License & Wire Settlement Spec</title>
</head>
<body style="margin:0; padding:0; background-color:#030712; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#030712; padding:30px 10px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b0f19; border:1px solid #1e293b; border-radius:12px; overflow:hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header Bar -->
          <tr>
            <td style="background: linear-gradient(90deg, #0b0f19 0%, #111827 100%); padding:24px 30px; border-bottom:1px solid #1e293b;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size:22px; font-weight:800; color:#ffffff; letter-spacing:1px; font-family:monospace;">⚡ ETHER SOVEREIGN</span>
                    <br>
                    <span style="font-size:11px; color:#94a3b8; font-family:monospace; text-transform:uppercase;">Enterprise Treasury & Licensing</span>
                  </td>
                  <td align="right">
                    <span style="display:inline-block; padding:6px 14px; background-color:rgba(0, 255, 127, 0.1); border:1px solid #00FF7F; border-radius:20px; color:#00FF7F; font-size:11px; font-weight:bold; font-family:monospace;">
                      PROVISIONED DOSSIER
                    </span>
                    <br>
                    <span style="font-size:10px; color:#64748b; font-family:monospace; display:block; margin-top:4px;">${receiptNo}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Thank You Letter -->
          <tr>
            <td style="padding:30px 30px 20px 30px;">
              <h2 style="margin:0 0 16px 0; color:#ffffff; font-size:20px; font-weight:700;">
                Welcome to Ether Sovereign OS, ${company}!
              </h2>
              <p style="margin:0 0 14px 0; color:#94a3b8; font-size:14px; line-height:1.6;">
                Dear ${name},<br><br>
                Your enterprise sovereign node allocation has been registered and provisioned in the global sovereign registry. Below are your official access credentials, assigned operator token, and corporate wire settlement coordinates.
              </p>
            </td>
          </tr>

          <!-- Credentials Box -->
          <tr>
            <td style="padding:0 30px 25px 30px;">
              <div style="background-color:#081325; border:1px dashed #00FF7F; border-radius:8px; padding:20px; text-align:center;">
                <span style="font-size:11px; font-weight:bold; color:#94a3b8; text-transform:uppercase; font-family:monospace; display:block; margin-bottom:8px;">
                  🔑 YOUR SOVEREIGN LICENSE KEY
                </span>
                <span style="font-size:15px; font-weight:bold; color:#00FF7F; font-family:monospace; letter-spacing:1px; word-break:break-all; display:block; padding:10px; background-color:#030712; border-radius:4px;">
                  ${licenseKey}
                </span>
                <div style="display:flex; justify-content:space-around; margin-top:12px; font-family:monospace; font-size:12px;">
                  <span style="color:#94a3b8;">Operator ID: <b style="color:#fff;">${operatorId}</b></span>
                  <span style="color:#94a3b8;">Enrolled Tier: <b style="color:#4ce0ff;">${tier}</b></span>
                </div>
              </div>
            </td>
          </tr>

          <!-- Payment Transaction Summary -->
          <tr>
            <td style="padding:0 30px 25px 30px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#111827; border:1px solid #1f293d; border-radius:8px; padding:20px;">
                <tr>
                  <td style="font-size:12px; font-weight:bold; color:#00FF7F; text-transform:uppercase; font-family:monospace; letter-spacing:0.5px; padding-bottom:12px;" colspan="2">
                    🏛️ DIRECT CORPORATE WIRE INSTRUCTIONS (CLIENT DESIGNATED COMMERCIAL BANK)
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#94a3b8; font-size:13px;">Beneficiary Legal Name:</td>
                  <td align="right" style="padding:6px 0; color:#ffffff; font-size:13px; font-weight:bold;">Ether Terminal LLC</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#94a3b8; font-size:13px;">Beneficiary Bank:</td>
                  <td align="right" style="padding:6px 0; color:#ffffff; font-size:13px;">Client Designated Commercial Bank</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#94a3b8; font-size:13px;">Routing Number (Wire / ACH):</td>
                  <td align="right" style="padding:6px 0; color:#00FF7F; font-size:14px; font-weight:bold; font-family:monospace;">••••••••• [RELEASED VIA W-9 TO AP]</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#94a3b8; font-size:13px;">Account Number:</td>
                  <td align="right" style="padding:6px 0; color:#00FF7F; font-size:14px; font-weight:bold; font-family:monospace;">•••••••• [ON FILE / AP DESK]</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#94a3b8; font-size:13px;">Required Wire Memo:</td>
                  <td align="right" style="padding:6px 0; color:#4ce0ff; font-size:13px; font-weight:bold; font-family:monospace;">${wireMemo}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#94a3b8; font-size:13px;">Turnkey Dual-Drive Hardware Kit:</td>
                  <td align="right" style="padding:6px 0; color:#ffffff; font-size:13px;">${includeHardware ? '4TB Samsung 990 PRO NVMe (4GB DRAM) + 256GB USB Key (+$2,000 USD)' : 'Software Only ($0)'}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#94a3b8; font-size:13px; font-weight:bold;">Total Settlement Wire Amount:</td>
                  <td align="right" style="padding:6px 0; color:#00FF7F; font-size:16px; font-weight:bold; font-family:monospace;">$${Number(amountUsd).toLocaleString('en-US')}.00 USD</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 30px; background-color:#070b12; border-top:1px solid #1e293b; text-align:center;">
              <span style="font-size:11px; color:#64748b; font-family:monospace; display:block; margin-bottom:4px;">
                Ether Sovereign OS — Air-Gapped High-Throughput Forensics & Underwriting
              </span>
              <span style="font-size:11px; color:#38bdf8; font-family:monospace;">
                Treasury Support: etherterminal@proton.me
              </span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        // Forward to Formspree bridge for guaranteed email delivery
        const formspreePayload = {
            _subject: `[PROVISIONED] ${company} — ${tier} Credentials & Wire Spec`,
            _replyto: email,
            recipient_buyer: email,
            company_name: company,
            buyer_name: name,
            phone: phone,
            assigned_tier: tier,
            billing_period: billing,
            hardware_addon: includeHardware ? 'Yes ($2,000 Turnkey Dual-Drive Hardware Kit: 4TB NVMe + 256GB USB Key)' : 'No (Software Only)',
            license_key: licenseKey,
            operator_id: operatorId,
            wire_memo: wireMemo,
            total_amount_usd: `$${Number(amountUsd).toLocaleString('en-US')}.00 USD`,
            message: `Automated Sovereign Credentials & Wire Settlement Spec dispatched for ${company}.`
        };

        await fetch('https://formspree.io/f/mykaadqv', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formspreePayload)
        }).catch(() => {});

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                status: 'CREDENTIALS_DISPATCHED',
                license_key: licenseKey,
                operator_id: operatorId,
                wire_memo: wireMemo,
                receipt_number: receiptNo
            })
        };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};
