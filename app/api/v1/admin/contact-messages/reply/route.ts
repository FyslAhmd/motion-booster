import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';
import { createMailerTransporter } from '@/lib/server/mailer';

const replySchema = z.object({
  messageId: z.string().trim().min(1, 'Message ID is required'),
  replyText: z.string().trim().min(2, 'Reply message is required').max(5000, 'Reply message is too long'),
});

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = replySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid request data' },
        { status: 400 },
      );
    }

    const { messageId, replyText } = parsed.data;

    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id: messageId },
      select: {
        id: true,
        fullName: true,
        email: true,
        queryDetails: true,
        source: true,
        isRead: true,
      },
    });

    if (!contactMessage) {
      return NextResponse.json({ success: false, error: 'Contact message not found' }, { status: 404 });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { success: false, error: 'SMTP is not configured. Please configure mail settings first.' },
        { status: 500 },
      );
    }

    const fromEmail = process.env.EMAIL_FROM || smtpUser || 'no-reply@motionbooster.com';
    const replyToEmail = process.env.CONTACT_RECEIVER_EMAIL || fromEmail;
    const sourceLabel = contactMessage.source.replace(/_/g, ' ');
    const subject = `Re: Your inquiry to Motion Booster (${sourceLabel})`;

    const transporter = createMailerTransporter();
    await transporter.sendMail({
      from: fromEmail,
      to: contactMessage.email,
      replyTo: replyToEmail,
      subject,
      text: [
        replyText,
        '',
        '--- Original Message ---',
        contactMessage.queryDetails,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <p style="margin: 0 0 14px; white-space: pre-wrap;">${escapeHtml(replyText)}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:14px 0;" />
          <p style="margin: 0 0 8px; font-size: 12px; color: #6b7280;">Original Message</p>
          <p style="margin: 0; white-space: pre-wrap; color: #374151;">${escapeHtml(contactMessage.queryDetails)}</p>
        </div>
      `,
    });

    if (!contactMessage.isRead) {
      await prisma.contactMessage.update({
        where: { id: contactMessage.id },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true, message: 'Reply email sent successfully.' });
  } catch (err: unknown) {
    console.error('[admin contact-messages reply POST]', err);
    const message = err instanceof Error && err.message ? err.message : 'Failed to send reply email';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
