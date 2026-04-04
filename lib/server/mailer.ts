import nodemailer from 'nodemailer';

let cachedTransporter: nodemailer.Transporter | null = null;

export function createMailerTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('SMTP credentials are not fully configured');
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
}

export function getMailerTransporter() {
  if (!cachedTransporter) {
    cachedTransporter = createMailerTransporter();
  }
  return cachedTransporter;
}

export async function sendPasswordResetOtpEmail(input: {
  to: string;
  otp: string;
  expiresInMinutes: number;
}) {
  const transporter = getMailerTransporter();
  const fromEmail =
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    'no-reply@motionbooster.com';

  const plainText = [
    'Motion Booster Password Reset Code',
    '',
    'Use the verification code below to reset your password.',
    '',
    `Verification code: ${input.otp}`,
    `Expires in: ${input.expiresInMinutes} minutes`,
    '',
    'If you did not request this action, you can safely ignore this email.',
    '',
    'For security reasons, do not share this code with anyone.',
  ].join('\n');

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset Code</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f3f4f6;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:28px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
                <tr>
                  <td style="background:linear-gradient(110deg,#ef4444 0%,#dc2626 60%,#b91c1c 100%);padding:22px 26px;color:#ffffff;">
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.2px;text-transform:uppercase;opacity:0.92;">Motion Booster</p>
                    <h1 style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:22px;line-height:1.25;font-weight:700;">Password Reset Verification</h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:24px 26px 22px;">
                    <p style="margin:0 0 10px;font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#111827;">
                      We received a request to reset your password. Use this verification code to continue:
                    </p>

                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:14px 0 8px;">
                      <tr>
                        <td align="center" style="background-color:#fff1f2;border:1px solid #fecdd3;border-radius:12px;padding:16px;">
                          <p style="margin:0;font-family:Arial,sans-serif;font-size:31px;font-weight:800;letter-spacing:7px;color:#b91c1c;line-height:1;">${input.otp}</p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:10px 0 0;font-family:Arial,sans-serif;font-size:14px;color:#374151;line-height:1.6;">
                      This code will expire in <strong>${input.expiresInMinutes} minutes</strong>.
                    </p>

                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                      <tr>
                        <td style="padding:12px 14px;">
                          <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#4b5563;">
                            Security tip: Never share this code with anyone. Motion Booster will never ask for your verification code via phone call or chat.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 26px 22px;border-top:1px solid #f3f4f6;">
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#6b7280;">
                      If you did not request a password reset, no further action is required.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: fromEmail,
    to: input.to,
    subject: 'Your Password Reset OTP',
    text: plainText,
    html,
  });
}
