import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { comparePassword, hashPassword } from '@/lib/auth/password';
import {
  createPasswordFingerprint,
  verifyPasswordResetSessionToken,
} from '@/lib/auth/password-reset';
import { emailSchema, passwordSchema } from '@/lib/validators/auth';

const resetPasswordSchema = z
  .object({
    email: emailSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    resetSessionToken: z.string().trim().min(20, 'Reset session token is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid payload' },
        { status: 400 }
      );
    }

    const { email, newPassword, resetSessionToken } = parsed.data;

    let resetSessionPayload;
    try {
      resetSessionPayload = await verifyPasswordResetSessionToken(resetSessionToken);
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid or expired reset session' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ success: false, error: 'Invalid reset session' }, { status: 400 });
    }

    const passwordFingerprint = createPasswordFingerprint(user.passwordHash);
    const emailMatches = resetSessionPayload.email === email;
    const userMatches = resetSessionPayload.userId === user.id;
    const fingerprintMatches = resetSessionPayload.passwordFingerprint === passwordFingerprint;

    if (!emailMatches || !userMatches || !fingerprintMatches) {
      return NextResponse.json({ success: false, error: 'Invalid reset session' }, { status: 400 });
    }

    const isSameAsOldPassword = await comparePassword(newPassword, user.passwordHash);
    if (isSameAsOldPassword) {
      return NextResponse.json(
        { success: false, error: 'New password must be different from your current password' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: user.id, isRevoked: false },
        data: { isRevoked: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    console.error('[forgot-password/reset-password]', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

