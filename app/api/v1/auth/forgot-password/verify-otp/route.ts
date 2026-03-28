import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import {
  createPasswordFingerprint,
  createPasswordResetSessionToken,
  verifyOtpCode,
  verifyPasswordResetOtpToken,
} from '@/lib/auth/password-reset';

const verifyOtpSchema = z.object({
  email: z.string().trim().email('Valid email is required').transform((v) => v.toLowerCase()),
  otp: z
    .string()
    .trim()
    .regex(/^\d{4,8}$/, 'OTP must be numeric'),
  resetToken: z.string().trim().min(20, 'Reset token is required'),
});

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid payload' },
        { status: 400 }
      );
    }

    const { email, otp, resetToken } = parsed.data;

    let otpPayload;
    try {
      otpPayload = await verifyPasswordResetOtpToken(resetToken);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP session' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: 'Invalid OTP or session' }, { status: 400 });
    }

    const passwordFingerprint = createPasswordFingerprint(user.passwordHash);
    const emailMatches = otpPayload.email === email;
    const userMatches = otpPayload.userId === user.id;
    const fingerprintMatches = otpPayload.passwordFingerprint === passwordFingerprint;

    if (!emailMatches || !userMatches || !fingerprintMatches) {
      return NextResponse.json({ success: false, error: 'Invalid OTP or session' }, { status: 400 });
    }

    const otpValid = verifyOtpCode({
      payload: otpPayload,
      email,
      otp,
      passwordFingerprint,
    });

    if (!otpValid) {
      return NextResponse.json({ success: false, error: 'Incorrect OTP code' }, { status: 400 });
    }

    const resetSessionToken = await createPasswordResetSessionToken({
      userId: user.id,
      email,
      passwordFingerprint,
    });

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      data: { resetSessionToken },
    });
  } catch (error) {
    console.error('[forgot-password/verify-otp]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

