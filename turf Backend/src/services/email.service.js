const https = require('https');

/**
 * Brevo / Sendinblue Email Service Plugin
 * Pluggable email dispatcher for Turf Admin credentials and system notifications.
 * Activates automatically when BREVO_API_KEY or BREVO_SMTP_KEY is defined in .env.
 */
const sendTurfAdminCredentialsEmail = async ({ recipientEmail, recipientName, password, businessName, planName }) => {
    const apiKey = process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@sportmatrix.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'SportMatrix Platform';

    if (!apiKey) {
        console.log(`[EMAIL PLUGIN] BREVO_API_KEY is missing in .env. Skipping automated email for ${recipientEmail}. (Fallback credentials displayed on screen / WhatsApp).`);
        return { success: false, skipped: true, reason: 'BREVO_API_KEY missing in environment' };
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; color: #374151; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
            .header { background: #111827; color: #ffffff; padding: 32px; text-align: center; }
            .badge { background: rgba(34, 197, 94, 0.2); color: #22c55e; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; display: inline-block; }
            .header h1 { margin: 12px 0 0 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; }
            .content { padding: 32px; font-size: 14px; line-height: 1.6; }
            .creds-box { background: #0f172a; color: #ffffff; padding: 20px 24px; border-radius: 14px; font-family: 'Courier New', monospace; font-size: 13px; margin: 24px 0; border: 1px solid #1e293b; }
            .creds-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1e293b; }
            .creds-label { color: #94a3b8; }
            .creds-val { color: #c8ff2e; font-weight: bold; }
            .btn-wrapper { text-align: center; margin-top: 28px; }
            .btn { display: inline-block; background: #16a34a; color: #ffffff !important; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.3); }
            .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <span class="badge">TURF ADMIN ONBOARDING</span>
                <h1>Welcome to SportMatrix!</h1>
            </div>
            <div class="content">
                <p>Hello <strong>${recipientName}</strong>,</p>
                <p>Your Turf Admin account for <strong>${businessName || 'SportMatrix Turf Arena'}</strong> is now live and ready! Below are your official login credentials to manage your turf portal:</p>
                
                <div class="creds-box">
                    <div class="creds-row">
                        <span class="creds-label">Admin Login Email:</span>
                        <span class="creds-val" style="color: #ffffff;">${recipientEmail}</span>
                    </div>
                    <div class="creds-row">
                        <span class="creds-label">Password:</span>
                        <span class="creds-val">${password}</span>
                    </div>
                    <div class="creds-row" style="border-bottom: none;">
                        <span class="creds-label">Active Plan:</span>
                        <span class="creds-val" style="color: #22c55e;">${planName || 'Standard Plan'}</span>
                    </div>
                </div>

                <p>You can now manage slots, view bookings, set sport pricing, and configure staff access.</p>
                <div class="btn-wrapper">
                    <a href="http://localhost:5173/login" class="btn">Login to Admin Portal &rarr;</a>
                </div>
            </div>
            <div class="footer">
                &copy; 2026 SportMatrix Platform · All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;

    const postData = JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: recipientEmail, name: recipientName }],
        subject: `🔑 Your Turf Admin Credentials - ${businessName || 'SportMatrix'}`,
        htmlContent: htmlContent
    });

    return new Promise((resolve) => {
        const req = https.request({
            hostname: 'api.brevo.com',
            port: 443,
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
                'content-length': Buffer.byteLength(postData)
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log(`[EMAIL PLUGIN SUCCESS] Credentials email dispatched via Brevo to ${recipientEmail}`);
                    resolve({ success: true, response: body });
                } else {
                    console.error(`[EMAIL PLUGIN ERROR] Brevo HTTP ${res.statusCode}:`, body);
                    resolve({ success: false, error: body });
                }
            });
        });

        req.on('error', (e) => {
            console.error('[EMAIL PLUGIN ERROR] Connection failure:', e);
            resolve({ success: false, error: e.message });
        });

        req.write(postData);
        req.end();
    });
};

module.exports = {
    sendTurfAdminCredentialsEmail
};
