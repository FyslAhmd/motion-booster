import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';

const contactSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(120),
  email: z.string().trim().email('Valid email is required').max(255),
  companyName: z.string().trim().max(255).optional().default(''),
  mobile: z.string().trim().min(6, 'Mobile number is required').max(40),
  queryDetails: z.string().trim().min(10, 'Message is too short').max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid request data' }, { status: 400 });
    }

    const { fullName, email, companyName, mobile, queryDetails } = parsed.data;

    await prisma.contactMessage.create({
      data: {
        fullName,
        email,
        companyName: companyName || null,
        mobile,
        queryDetails,
        source: 'CONTACT_US',
      },
    });

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const recipientEmail = process.env.CONTACT_RECEIVER_EMAIL || 'hello@motionbooster.com';
    const fromEmail = process.env.EMAIL_FROM || smtpUser || 'no-reply@motionbooster.com';

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { message: 'Your message has been received successfully.' },
        { status: 200 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: fromEmail,
      to: recipientEmail,
      replyTo: email,
      subject: `New Contact Message from ${fullName}`,
      text: [
        `Name: ${fullName}`,
        `Email: ${email}`,
        `Company: ${companyName || 'N/A'}`,
        `Mobile: ${mobile}`,
        '',
        'Message:',
        queryDetails,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
          <h2 style="margin-bottom: 12px;">New Contact Form Message</h2>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
          <p><strong>Mobile:</strong> ${mobile}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${queryDetails}</p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'Your message has been sent successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Contact form submission failed:', error);
    return NextResponse.json({ error: 'Failed to process your request' }, { status: 500 });
  }
}
