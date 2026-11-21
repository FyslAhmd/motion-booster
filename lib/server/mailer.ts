import nodemailer from 'nodemailer';

let cachedTransporter: nodemailer.Transporter | null = null;

function resetMailerTransporter() {
  cachedTransporter = null;
}

function isTransientSmtpAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const typed = error as { code?: string; response?: string; message?: string };
  const details = `${typed.response || ''} ${typed.message || ''}`.toLowerCase();

  return typed.code === 'EAUTH' && (details.includes('454') || details.includes('try again later'));
}

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

  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const transporter = getMailerTransporter();
      const info = await transporter.sendMail({
        from: fromEmail,
        to: input.to,
        subject: 'Your Password Reset OTP',
        text: plainText,
        html,
      });

      if (Array.isArray(info.rejected) && info.rejected.length > 0) {
        throw new Error(`SMTP rejected recipients: ${info.rejected.join(', ')}`);
      }

      return;
    } catch (error) {
      lastError = error;

      // Hostinger sometimes returns temporary auth throttling (EAUTH 454).
      // Resetting cached transporter and retrying once often recovers.
      if (attempt === 1 && isTransientSmtpAuthError(error)) {
        resetMailerTransporter();
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function trimPreview(input: string, maxLength: number) {
  const normalized = input.trim().replace(/\s+/g, ' ');
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}...`;
}

type ChatAlertMessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'VOICE';

export async function sendAdminChatAlertEmail(input: {
  senderName: string;
  senderEmail: string;
  senderRole: string;
  messageType: ChatAlertMessageType;
  content?: string;
  conversationId: string;
  messageId: string;
  createdAt: Date;
  to?: string;
}) {
  const recipient =
    input.to?.trim() ||
    process.env.CHAT_ALERT_ADMIN_EMAIL?.trim() ||
    'mdmehrab254.mk@gmail.com';

  if (!recipient) return;

  const fromEmail =
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    'no-reply@motionbooster.com';

  const messageTypeLabel: Record<ChatAlertMessageType, string> = {
    TEXT: 'Text',
    IMAGE: 'Image',
    VIDEO: 'Video',
    FILE: 'File',
    VOICE: 'Voice',
  };

  const rawContent = (input.content || '').trim();
  const preview =
    input.messageType === 'TEXT'
      ? (rawContent ? trimPreview(rawContent, 220) : '(empty text message)')
      : `(${messageTypeLabel[input.messageType]} message)`;

  const sentAt = input.createdAt.toISOString();
  const subject = `New chat message from ${input.senderName}`;

  const plainText = [
    'Motion Booster - New Chat Message Alert',
    '',
    `Sender: ${input.senderName} (${input.senderEmail})`,
    `Sender role: ${input.senderRole}`,
    `Message type: ${messageTypeLabel[input.messageType]}`,
    `Message preview: ${preview}`,
    `Conversation ID: ${input.conversationId}`,
    `Message ID: ${input.messageId}`,
    `Sent at (UTC): ${sentAt}`,
    '',
    'Open dashboard: /dashboard/chat',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="margin:0 0 12px; font-size:18px;">New Chat Message Alert</h2>
      <p style="margin:0 0 10px;"><strong>Sender:</strong> ${escapeHtml(input.senderName)} (${escapeHtml(input.senderEmail)})</p>
      <p style="margin:0 0 10px;"><strong>Sender role:</strong> ${escapeHtml(input.senderRole)}</p>
      <p style="margin:0 0 10px;"><strong>Message type:</strong> ${escapeHtml(messageTypeLabel[input.messageType])}</p>
      <p style="margin:0 0 10px;"><strong>Message preview:</strong> ${escapeHtml(preview)}</p>
      <p style="margin:0 0 10px;"><strong>Conversation ID:</strong> ${escapeHtml(input.conversationId)}</p>
      <p style="margin:0 0 10px;"><strong>Message ID:</strong> ${escapeHtml(input.messageId)}</p>
      <p style="margin:0 0 10px;"><strong>Sent at (UTC):</strong> ${escapeHtml(sentAt)}</p>
      <p style="margin:12px 0 0;">Open dashboard: <strong>/dashboard/chat</strong></p>
    </div>
  `;

  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const transporter = getMailerTransporter();
      const info = await transporter.sendMail({
        from: fromEmail,
        replyTo: process.env.SMTP_USER || fromEmail,
        to: recipient,
        subject,
        text: plainText,
        html,
      });

      if (Array.isArray(info.rejected) && info.rejected.length > 0) {
        throw new Error(`SMTP rejected recipients: ${info.rejected.join(', ')}`);
      }

      return;
    } catch (error) {
      lastError = error;

      if (attempt === 1 && isTransientSmtpAuthError(error)) {
        resetMailerTransporter();
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export interface DailySpendCampaignItem {
  campaignName: string;
  status: string;
  resultLabel?: string;
  resultValue?: number;
  costLabel?: string;
  costPerResultUsd?: number;
  costPerResultBdt?: number;
  spendUsd: number;
  spendBdt: number;
  impressions: number;
  clicks: number;
  cpc?: number;
  ctr?: number;
}

export interface SendDailySpendEmailInput {
  to: string;
  recipientName: string;
  reportDateFormatted: string;
  totalSpendUsd: number;
  totalSpendBdt: number;
  totalImpressions: number;
  totalClicks: number;
  resultsSummary?: Array<{ label: string; value: number }>;
  campaigns: DailySpendCampaignItem[];
  dashboardUrl?: string;
}

export async function sendDailySpendReportEmail(input: SendDailySpendEmailInput) {
  const fromEmail =
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    'no-reply@motionbooster.com';

  const recipient = (input.to || '').trim();
  if (!recipient) {
    throw new Error('Recipient email is missing');
  }

  const subject = `Motion Booster: Daily Ad Spend Report (${input.reportDateFormatted})`;

  const campaignRowsHtml = input.campaigns
    .map((c, i) => {
      const isEven = i % 2 === 0;
      const statusBg = c.status === 'ACTIVE' ? '#dcfce7' : '#fef3c7';
      const statusColor = c.status === 'ACTIVE' ? '#15803d' : '#b45309';

      const hasResults = typeof c.resultValue === 'number' && c.resultValue > 0;
      const resultDisplay = hasResults
        ? `<div style="font-size:14px;font-weight:700;color:#111827;">${c.resultValue!.toLocaleString()}</div><div style="font-size:11px;color:#4b5563;font-weight:600;">${escapeHtml(c.resultLabel || 'Results')}</div>`
        : `<span style="font-size:12px;color:#9ca3af;">0 ${escapeHtml(c.resultLabel || 'Results')}</span>`;

      const hasCost = hasResults && typeof c.costPerResultUsd === 'number' && c.costPerResultUsd > 0;
      const costDisplay = hasCost
        ? `<div style="font-size:13px;font-weight:700;color:#111827;">$${c.costPerResultUsd!.toFixed(2)}</div><div style="font-size:11px;color:#dc2626;font-weight:600;">৳${(c.costPerResultBdt || c.costPerResultUsd! * 145).toFixed(2)}</div>`
        : `<span style="color:#9ca3af;font-size:12px;">—</span>`;

      return `
        <tr style="background-color:${isEven ? '#ffffff' : '#f9fafb'};">
          <td style="padding:10px 12px;font-size:13px;color:#111827;border-bottom:1px solid #e5e7eb;font-weight:600;max-width:180px;word-break:break-word;">
            ${escapeHtml(c.campaignName)}
          </td>
          <td style="padding:10px 10px;font-size:12px;border-bottom:1px solid #e5e7eb;white-space:nowrap;">
            <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:700;text-transform:uppercase;background-color:${statusBg};color:${statusColor};">
              ${escapeHtml(c.status)}
            </span>
          </td>
          <td style="padding:10px 10px;font-size:13px;border-bottom:1px solid #e5e7eb;">
            ${resultDisplay}
          </td>
          <td style="padding:10px 10px;font-size:13px;border-bottom:1px solid #e5e7eb;text-align:right;">
            ${costDisplay}
          </td>
          <td style="padding:10px 12px;font-size:13px;border-bottom:1px solid #e5e7eb;text-align:right;">
            <div style="font-weight:700;color:#111827;">$${c.spendUsd.toFixed(2)}</div>
            <div style="font-size:11px;color:#dc2626;font-weight:700;">৳${c.spendBdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </td>
          <td style="padding:10px 12px;font-size:13px;color:#4b5563;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">
            ${c.impressions.toLocaleString()}
          </td>
        </tr>
      `;
    })
    .join('');

  const resultsSummaryText = input.resultsSummary && input.resultsSummary.length > 0
    ? `- Key Results: ${input.resultsSummary.map((r) => `${r.value.toLocaleString()} ${r.label}`).join(', ')}`
    : '';

  const plainText = [
    `Motion Booster: Daily Ad Spend Report`,
    `Date: ${input.reportDateFormatted}`,
    `Recipient: ${input.recipientName}`,
    '',
    `Summary:`,
    `- Total Spend (USD): $${input.totalSpendUsd.toFixed(2)}`,
    `- Total Spend (BDT): ৳${input.totalSpendBdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (1 USD = 145 BDT)`,
    ...(resultsSummaryText ? [resultsSummaryText] : []),
    `- Impressions: ${input.totalImpressions.toLocaleString()}`,
    `- Clicks: ${input.totalClicks.toLocaleString()}`,
    '',
    `Campaigns Breakdown:`,
    ...input.campaigns.map((c) => {
      const resultPart = c.resultValue && c.resultValue > 0
        ? `Result: ${c.resultValue} ${c.resultLabel || 'Results'} (Cost: $${(c.costPerResultUsd || 0).toFixed(2)} / ৳${(c.costPerResultBdt || 0).toFixed(2)})`
        : `Result: 0 ${c.resultLabel || 'Results'}`;
      return `* ${c.campaignName} [${c.status}]:\n  - ${resultPart}\n  - Spend: $${c.spendUsd.toFixed(2)} (৳${c.spendBdt.toFixed(2)}) | ${c.impressions} Impr | ${c.clicks} Clicks`;
    }),
    '',
    `Dashboard: ${input.dashboardUrl || 'https://motionbooster.com'}/dashboard/my-campaigns`,
  ].join('\n');

  const resultsSummaryHtml = input.resultsSummary && input.resultsSummary.length > 0
    ? `
      <div style="margin-top:6px;padding:6px 10px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;">
        <span style="font-size:10px;color:#6b7280;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Key Results:</span>
        <div style="font-size:13px;font-weight:800;color:#111827;margin-top:2px;">
          ${input.resultsSummary.map((r) => `${r.value.toLocaleString()} ${escapeHtml(r.label)}`).join(' • ')}
        </div>
      </div>
    `
    : '';

  const totalResultsColHtml = input.resultsSummary && input.resultsSummary.length > 0
    ? input.resultsSummary.map((r) => `<span style="font-weight:800;color:#991b1b;">${r.value.toLocaleString()}</span> <span style="font-size:10px;color:#7f1d1d;font-weight:600;">${escapeHtml(r.label)}</span>`).join('<br/>')
    : '—';

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Daily Ad Spend Report</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f3f4f6;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:680px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg, #111827 0%, #1f2937 60%, #dc2626 100%);padding:26px 28px;color:#ffffff;">
                    <p style="margin:0;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;color:#fca5a5;">MOTION BOOSTER • DAILY PERFORMANCE</p>
                    <h1 style="margin:8px 0 4px;font-size:22px;line-height:1.2;font-weight:800;color:#ffffff;">Daily Ad Spend Report</h1>
                    <p style="margin:0;font-size:13px;color:#d1d5db;">${escapeHtml(input.reportDateFormatted)}</p>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding:24px 28px;">
                    <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#374151;">
                      Hello <strong>${escapeHtml(input.recipientName)}</strong>,<br/>
                      Here is the full performance and ad spend breakdown for your assigned campaigns yesterday.
                    </p>

                    <!-- Summary KPI Cards -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
                      <tr>
                        <td width="48%" style="padding:14px;background-color:#fef2f2;border:1px solid #fecaca;border-radius:12px;vertical-align:top;">
                          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;color:#991b1b;letter-spacing:0.5px;">Yesterday Total Spend</p>
                          <p style="margin:6px 0 0;font-size:24px;font-weight:800;color:#b91c1c;line-height:1;">
                            $${input.totalSpendUsd.toFixed(2)}
                          </p>
                          <p style="margin:4px 0 0;font-size:13px;font-weight:700;color:#dc2626;">
                            ৳${input.totalSpendBdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p style="margin:4px 0 0;font-size:10px;color:#7f1d1d;opacity:0.8;">Rate: 1 USD = 145 BDT</p>
                        </td>
                        <td width="4%"></td>
                        <td width="48%" style="padding:14px;background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;vertical-align:top;">
                          <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;color:#4b5563;letter-spacing:0.5px;">Performance Overview</p>
                          ${resultsSummaryHtml}
                          <div style="margin-top:6px;">
                            <span style="font-size:13px;color:#6b7280;">Impressions:</span>
                            <span style="font-size:14px;font-weight:700;color:#111827;margin-left:4px;">${input.totalImpressions.toLocaleString()}</span>
                          </div>
                          <div style="margin-top:4px;">
                            <span style="font-size:13px;color:#6b7280;">Clicks:</span>
                            <span style="font-size:14px;font-weight:700;color:#111827;margin-left:4px;">${input.totalClicks.toLocaleString()}</span>
                          </div>
                          <div style="margin-top:4px;">
                            <span style="font-size:13px;color:#6b7280;">Active Campaigns:</span>
                            <span style="font-size:14px;font-weight:700;color:#111827;margin-left:4px;">${input.campaigns.length}</span>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Campaigns Breakdown Table -->
                    <h3 style="margin:20px 0 10px;font-size:14px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:0.5px;">Campaign Breakdown</h3>
                    <div style="overflow-x:auto;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                        <thead>
                          <tr style="background-color:#f3f4f6;">
                            <th align="left" style="padding:9px 12px;font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Campaign</th>
                            <th align="left" style="padding:9px 10px;font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Status</th>
                            <th align="left" style="padding:9px 10px;font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Results</th>
                            <th align="right" style="padding:9px 10px;font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Cost / Result</th>
                            <th align="right" style="padding:9px 12px;font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Spend</th>
                            <th align="right" style="padding:9px 12px;font-size:11px;font-weight:700;color:#4b5563;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Impr.</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${campaignRowsHtml}
                          <!-- Total Row -->
                          <tr style="background-color:#fee2e2;">
                            <td colspan="2" style="padding:10px 12px;font-size:12px;font-weight:800;color:#991b1b;border-top:2px solid #f87171;">
                              TOTAL
                            </td>
                            <td style="padding:10px 10px;font-size:12px;border-top:2px solid #f87171;">
                              ${totalResultsColHtml}
                            </td>
                            <td align="right" style="padding:10px 10px;font-size:12px;font-weight:700;color:#991b1b;border-top:2px solid #f87171;">
                              —
                            </td>
                            <td align="right" style="padding:10px 12px;border-top:2px solid #f87171;">
                              <div style="font-size:13px;font-weight:800;color:#991b1b;">$${input.totalSpendUsd.toFixed(2)}</div>
                              <div style="font-size:11px;font-weight:800;color:#991b1b;">৳${input.totalSpendBdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            </td>
                            <td align="right" style="padding:10px 12px;font-size:12px;font-weight:700;color:#991b1b;border-top:2px solid #f87171;">
                              ${input.totalImpressions.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Call to action button -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:24px;">
                      <tr>
                        <td align="center">
                          <a href="${(input.dashboardUrl || 'https://motionbooster.com').replace(/\/$/, '')}/dashboard/my-campaigns" target="_blank" style="display:inline-block;background-color:#dc2626;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 26px;border-radius:10px;box-shadow:0 2px 4px rgba(220,38,38,0.3);">
                            Open Live Campaign Dashboard →
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:22px 0 0;font-size:12px;line-height:1.5;color:#6b7280;text-align:center;">
                      This report is generated automatically at 1:00 AM every night.<br/>
                      If you have questions or need to add balance, contact your Motion Booster manager.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#f9fafb;padding:16px 28px;border-top:1px solid #e5e7eb;text-align:center;">
                    <p style="margin:0;font-size:11px;color:#9ca3af;">
                      © ${new Date().getFullYear()} Motion Booster. All rights reserved.
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

  let lastError: unknown;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const transporter = getMailerTransporter();
      const info = await transporter.sendMail({
        from: fromEmail,
        replyTo: process.env.SMTP_USER || fromEmail,
        to: recipient,
        subject,
        text: plainText,
        html,
      });

      if (Array.isArray(info.rejected) && info.rejected.length > 0) {
        throw new Error(`SMTP rejected recipients: ${info.rejected.join(', ')}`);
      }

      return;
    } catch (error) {
      lastError = error;

      if (attempt === 1 && isTransientSmtpAuthError(error)) {
        resetMailerTransporter();
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}
