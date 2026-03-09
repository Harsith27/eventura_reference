import nodemailer from 'nodemailer';

// Configure your email service here
// For Gmail: Use App Passwords (2FA enabled)
// For other services: Update the transporter config
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const DEFAULT_SUPERADMIN_EMAIL = 'myprojecthub27@gmail.com';

export function getSuperadminEmail() {
  return process.env.SUPERADMIN_EMAIL || DEFAULT_SUPERADMIN_EMAIL;
}

type ApprovalRequestEmailParams = {
  type: 'ADMIN' | 'ORGANIZER';
  requesterName: string;
  requesterEmail: string;
  collegeName?: string;
  organizationName?: string;
  reason?: string;
};

type ApprovalGrantedEmailParams = {
  type: 'ADMIN' | 'ORGANIZER';
  recipientEmail: string;
  recipientName: string;
  collegeName?: string;
  organizationName?: string;
};

export async function sendApprovalRequestEmail(params: ApprovalRequestEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventura.example.com';
  const reviewUrl = `${appUrl}/superadmin/dashboard`;
  const subject =
    params.type === 'ADMIN'
      ? 'Eventura: New admin access request'
      : 'Eventura: New organizer approval request';

  const headerTitle =
    params.type === 'ADMIN' ? 'New Admin Request' : 'New Organizer Request';

  const requestDetails = params.type === 'ADMIN'
    ? `
      <p><strong>College:</strong> ${params.collegeName || 'N/A'}</p>
      <p><strong>Requester:</strong> ${params.requesterName}</p>
      <p><strong>Email:</strong> ${params.requesterEmail}</p>
    `
    : `
      <p><strong>College:</strong> ${params.organizationName || 'N/A'}</p>
      <p><strong>Requester:</strong> ${params.requesterName}</p>
      <p><strong>Email:</strong> ${params.requesterEmail}</p>
      ${params.reason ? `<p><strong>Reason:</strong> ${params.reason}</p>` : ''}
    `;

  try {
    await transporter.sendMail({
      from: `"Eventura Notifications" <${process.env.EMAIL_USER}>`,
      to: getSuperadminEmail(),
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #222;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 24px;
                background-color: #f8f9fb;
              }
              .header {
                background: #050607;
                color: #5ad7ff;
                padding: 24px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #ffffff;
                padding: 24px;
                border-radius: 0 0 10px 10px;
              }
              .details {
                background: #f3f4f6;
                padding: 16px;
                border-radius: 8px;
                margin: 16px 0;
              }
              .button {
                display: inline-block;
                background-color: #5ad7ff;
                color: #050607;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
              }
              .footer {
                text-align: center;
                margin-top: 24px;
                color: #777;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 22px;">${headerTitle}</h1>
                <p style="margin: 8px 0 0; font-size: 13px;">Action needed: review and approve</p>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>A new request has been submitted and is awaiting approval in Eventura.</p>
                <div class="details">
                  ${requestDetails}
                </div>
                <p>Please review the request in the dashboard.</p>
                <p>
                  <a class="button" href="${reviewUrl}">Visit Eventura to Approve</a>
                </p>
                <p>Best regards,<br><strong>Eventura</strong></p>
              </div>
              <div class="footer">
                <p>Eventura Notifications</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
${headerTitle}

A new request has been submitted and is awaiting approval in Eventura.

${params.type === 'ADMIN' ? 'College' : 'College'}: ${
        params.type === 'ADMIN' ? params.collegeName || 'N/A' : params.organizationName || 'N/A'
      }
Requester: ${params.requesterName}
Email: ${params.requesterEmail}
${params.reason ? `Reason: ${params.reason}` : ''}

Visit Eventura to approve: ${reviewUrl}

Eventura Notifications
      `,
    });
  } catch (error) {
    console.error('Error sending approval request email:', error);
  }
}

export async function sendApprovalGrantedEmail(params: ApprovalGrantedEmailParams) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eventura.example.com';
  const loginUrl = `${appUrl}/login`;
  const subject =
    params.type === 'ADMIN'
      ? 'Eventura: Your admin access is approved'
      : 'Eventura: Your organizer access is approved';
  const title = params.type === 'ADMIN' ? 'Admin Access Approved' : 'Organizer Access Approved';
  const contextLine = params.type === 'ADMIN'
    ? `Your admin access for ${params.collegeName || 'your college'} is now active.`
    : `Your organizer access for ${params.organizationName || 'your college'} is now active.`;

  try {
    await transporter.sendMail({
      from: `"Eventura Notifications" <${process.env.EMAIL_USER}>`,
      to: params.recipientEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #222;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 24px;
                background-color: #f8f9fb;
              }
              .header {
                background: #050607;
                color: #5ad7ff;
                padding: 24px;
                border-radius: 10px 10px 0 0;
                text-align: center;
              }
              .content {
                background: #ffffff;
                padding: 24px;
                border-radius: 0 0 10px 10px;
              }
              .button {
                display: inline-block;
                background-color: #5ad7ff;
                color: #050607;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
              }
              .footer {
                text-align: center;
                margin-top: 24px;
                color: #777;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 22px;">${title}</h1>
                <p style="margin: 8px 0 0; font-size: 13px;">You can now sign in</p>
              </div>
              <div class="content">
                <p>Hi <strong>${params.recipientName}</strong>,</p>
                <p>${contextLine}</p>
                <p>Visit Eventura to sign in with your account.</p>
                <p>
                  <a class="button" href="${loginUrl}">Sign in to Eventura</a>
                </p>
                <p>Best regards,<br><strong>Eventura</strong></p>
              </div>
              <div class="footer">
                <p>Eventura Notifications</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
${title}

Hi ${params.recipientName},

${contextLine}

Visit Eventura to sign in with your account: ${loginUrl}

Eventura Notifications
      `,
    });
  } catch (error) {
    console.error('Error sending approval granted email:', error);
  }
}

export async function sendAdminPasswordEmail(
  email: string,
  firstName: string,
  collegeName: string,
  temporaryPassword: string
) {
  try {
    const mailOptions = {
      from: `"Eventura Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Eventura Admin Account - Login Credentials',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f9f9f9;
              }
              .header {
                background: linear-gradient(135deg, #050607 0%, #1a1a1a 100%);
                color: #5ad7ff;
                padding: 30px;
                border-radius: 8px 8px 0 0;
                text-align: center;
              }
              .content {
                background: white;
                padding: 30px;
                border-radius: 0 0 8px 8px;
              }
              .credentials {
                background-color: #f0f0f0;
                padding: 20px;
                border-radius: 6px;
                margin: 20px 0;
                border-left: 4px solid #5ad7ff;
              }
              .credential-item {
                margin: 12px 0;
              }
              .credential-label {
                font-weight: 600;
                color: #555;
              }
              .credential-value {
                font-family: 'Courier New', monospace;
                background: white;
                padding: 8px 12px;
                border-radius: 4px;
                margin-top: 4px;
                word-break: break-all;
              }
              .warning {
                background-color: #fff3cd;
                border: 1px solid #ffc107;
                color: #856404;
                padding: 15px;
                border-radius: 6px;
                margin: 20px 0;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #888;
                font-size: 12px;
              }
              .button {
                display: inline-block;
                background-color: #5ad7ff;
                color: #050607;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">Welcome to Eventura</h1>
                <p style="margin: 10px 0 0 0; font-size: 14px;">Admin Dashboard Access</p>
              </div>
              
              <div class="content">
                <p>Hi <strong>${firstName}</strong>,</p>
                
                <p>Your admin account for <strong>${collegeName}</strong> has been successfully created on Eventura. You can now access the admin dashboard to manage your college's events.</p>
                
                <div class="credentials">
                  <div class="credential-item">
                    <span class="credential-label">📧 Email:</span>
                    <div class="credential-value">${email}</div>
                  </div>
                  <div class="credential-item">
                    <span class="credential-label">🔐 Temporary Password:</span>
                    <div class="credential-value">${temporaryPassword}</div>
                  </div>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Important Security Notice:</strong>
                  <ul style="margin: 8px 0; padding-left: 20px;">
                    <li>This is a temporary password. Change it immediately after your first login.</li>
                    <li>Keep your credentials secure and do not share them with anyone.</li>
                    <li>If you did not request this account, please contact support immediately.</li>
                  </ul>
                </div>
                
                <center>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://eventura.example.com'}/login" class="button">Go to Admin Dashboard</a>
                </center>
                
                <p>If you have any questions or need assistance, please contact our support team.</p>
                
                <p>Best regards,<br><strong>The Eventura Team</strong></p>
              </div>
              
              <div class="footer">
                <p>© 2026 Eventura. All rights reserved.</p>
                <p>If you did not request this email, please ignore it.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Welcome to Eventura!

Your admin account for ${collegeName} has been successfully created.

Login Credentials:
Email: ${email}
Temporary Password: ${temporaryPassword}

⚠️ IMPORTANT:
- This is a temporary password. Change it immediately after your first login.
- Keep your credentials secure and do not share them with anyone.

Go to login: ${process.env.NEXT_PUBLIC_APP_URL || 'https://eventura.example.com'}/login

Best regards,
The Eventura Team

© 2026 Eventura. All rights reserved.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password email sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email' 
    };
  }
}

export async function verifyEmailConfiguration() {
  try {
    await transporter.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}
