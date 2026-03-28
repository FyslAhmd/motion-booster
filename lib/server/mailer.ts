import nodemailer from 'nodemailer';

let cachedTransporter: nodemailer.Transporter | null = null;

function createTransporter() {
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
    cachedTransporter = createTransporter();
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
    'Password Reset OTP',
    '',
    `Your OTP is: ${input.otp}`,
    `This OTP will expire in ${input.expiresInMinutes} minutes.`,
    '',
    'If you did not request this, please ignore this email.',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 8px;">Password Reset OTP</h2>
      <p style="margin-bottom: 10px;">Use the OTP below to reset your password:</p>
      <div style="display:inline-block;padding:10px 16px;border-radius:8px;background:#fee2e2;color:#b91c1c;font-size:24px;font-weight:700;letter-spacing:4px;">
        ${input.otp}
      </div>
      <p style="margin-top: 12px;">This OTP will expire in <strong>${input.expiresInMinutes} minutes</strong>.</p>
      <p style="margin-top: 16px; color: #6b7280;">If you did not request this, please ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: fromEmail,
    to: input.to,
    subject: 'Your Password Reset OTP',
    text: plainText,
    html,
  });
}

