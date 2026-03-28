import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import {
  createPasswordFingerprint,
  createPasswordResetOtpToken,
  generateNumericOtp,
} from '@/lib/auth/password-reset';
import { sendPasswordResetOtpEmail } from '@/lib/server/mailer';

const requestOtpSchema = z.object({
  email: z.string().trim().email('Valid email is required').transform((v) => v.toLowerCase()),
});

const OTP_EXPIRY_MINUTES = Number(process.env.PASSWORD_RESET_OTP_EXPIRY_MINUTES || 10);

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const parsed = requestOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid email' },
        { status: 400 }
      );
    }

    const email = parsed.data.email;
    const otp = generateNumericOtp();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        status: true,
      },
    });

    const fallbackFingerprint = createPasswordFingerprint(
      `fallback:${email}:${Date.now()}:${crypto.randomUUID()}`
    );

    const passwordFingerprint = user ? createPasswordFingerprint(user.passwordHash) : fallbackFingerprint;
    const resetToken = await createPasswordResetOtpToken({
      userId: user?.id || `unknown-${crypto.randomUUID()}`,
      email,
      otp,
      passwordFingerprint,
    });

    if (user && user.status === 'ACTIVE') {
      try {
        await sendPasswordResetOtpEmail({
          to: user.email,
          otp,
          expiresInMinutes: Math.max(1, OTP_EXPIRY_MINUTES),
        });
      } catch (error) {
        console.error('[forgot-password/request-otp] SMTP send failed:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to send OTP email. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'If this email is registered, an OTP has been sent.',
      data: {
        resetToken,
        expiresInMinutes: Math.max(1, OTP_EXPIRY_MINUTES),
      },
    });
  } catch (error) {
    console.error('[forgot-password/request-otp]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

