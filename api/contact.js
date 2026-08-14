export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const body = req.body || {};

    // Anti-spam Honeypot check
    if (body.website) {
      return res.status(200).json({ success: true, message: 'Enquiry received' });
    }

    const { Name, Phone, Email, Matter, Description } = body;

    if (!Name || !Email || !Description) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields (Name, Email, and Description).'
      });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const recipientEmail = 'info@shethassociates.in';
    const senderEmail = 'SHETH ASSOCIATES Website <info@shethassociates.in>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; color: #1a2533; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e1e6eb; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #0a1728; color: #c5a059; padding: 24px 30px; text-align: left; }
          .header h2 { margin: 0; font-size: 20px; letter-spacing: 1px; font-weight: 600; text-transform: uppercase; }
          .header p { margin: 4px 0 0 0; color: #a3b3c2; font-size: 13px; }
          .body { padding: 30px; }
          .field-group { margin-bottom: 20px; border-bottom: 1px solid #f0f3f6; padding-bottom: 15px; }
          .field-group:last-child { border-bottom: none; }
          .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7c93; font-weight: 700; margin-bottom: 4px; }
          .value { font-size: 15px; color: #0a1728; font-weight: 500; line-height: 1.5; }
          .description-box { background: #f8fafc; padding: 16px; border-left: 3px solid #c5a059; border-radius: 4px; white-space: pre-wrap; font-size: 14px; color: #2d3748; line-height: 1.6; }
          .footer { background: #f8fafc; padding: 16px 30px; border-top: 1px solid #e1e6eb; font-size: 12px; color: #8492a6; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h2>SHETH ASSOCIATES</h2>
            <p>New Website Inquiry</p>
          </div>
          <div class="body">
            <div class="field-group">
              <div class="label">Client Name</div>
              <div class="value">${escapeHtml(Name)}</div>
            </div>
            <div class="field-group">
              <div class="label">Email Address</div>
              <div class="value"><a href="mailto:${escapeHtml(Email)}" style="color: #0a1728; text-decoration: underline;">${escapeHtml(Email)}</a></div>
            </div>
            <div class="field-group">
              <div class="label">Phone Number</div>
              <div class="value">${escapeHtml(Phone || 'Not provided')}</div>
            </div>
            <div class="field-group">
              <div class="label">Nature of Matter</div>
              <div class="value">${escapeHtml(Matter || 'General Legal Matter')}</div>
            </div>
            <div class="field-group">
              <div class="label">Brief Description</div>
              <div class="description-box">${escapeHtml(Description)}</div>
            </div>
          </div>
          <div class="footer">
            Sent via SHETH ASSOCIATES Website Contact Form (${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST)
          </div>
        </div>
      </body>
      </html>
    `;

    const resendPayload = {
      from: senderEmail,
      to: [recipientEmail],
      reply_to: Email,
      subject: `New Inquiry: ${Matter || 'Legal Matter'} — ${Name}`,
      html: htmlContent
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(resendPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API Error:', data);
      return res.status(response.status).json({
        success: false,
        error: data.message || 'Failed to send email via Resend'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Your enquiry has been received. Our team will contact you shortly.',
      id: data.id
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while sending your enquiry.'
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
