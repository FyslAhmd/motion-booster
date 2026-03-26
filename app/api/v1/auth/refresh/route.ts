import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '@/lib/auth/tokens';
import { isRecoverableDbError } from '@/lib/server/db-error';

/**
 * POST /api/v1/auth/refresh
 *
 * Uses the HttpOnly `refreshToken` cookie to issue a new access + refresh token pair.
 * Implements refresh-token rotation: the old refresh token is revoked and a new one is issued.
 * If a revoked token is reused (potential theft), the entire token family is revoked.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get refresh token from cookie
    const rawToken = request.cookies.get('refreshToken')?.value;
    if (!rawToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // 2. Verify the JWT signature & expiry
    let payload;
    try {
      payload = await verifyRefreshToken(rawToken);
    } catch {
      // Token is expired or tampered — clear cookies
      const res = NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
      clearCookies(res);
      return res;
    }

    const { userId, familyId } = payload;

    // 3. Find the stored token hash in DB
    const tokenHash = await hashToken(rawToken);
    const storedToken = await prisma.refreshToken.findFirst({
      where: { tokenHash, familyId },
    });

    if (!storedToken) {
      // Token not found — possible theft. Revoke entire family.
      await prisma.refreshToken.updateMany({
        where: { familyId },
        data: { isRevoked: true },
      });
      const res = NextResponse.json(
        { error: 'Token reuse detected — session revoked' },
        { status: 401 }
      );
      clearCookies(res);
      return res;
    }

    if (storedToken.isRevoked) {
      // Already-revoked token reused — revoke entire family (theft detection)
      await prisma.refreshToken.updateMany({
        where: { familyId },
        data: { isRevoked: true },
      });
      const res = NextResponse.json(
        { error: 'Token reuse detected — session revoked' },
        { status: 401 }
      );
      clearCookies(res);
      return res;
    }

    // 4. Check that the user is still valid
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        avatarUrl: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      await prisma.refreshToken.updateMany({
        where: { familyId },
        data: { isRevoked: true },
      });
      const res = NextResponse.json(
        { error: 'Account not found or inactive' },
        { status: 401 }
      );
      clearCookies(res);
      return res;
    }

    // 5. Revoke the old refresh token (rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // 6. Generate new token pair
    const [newAccessToken, newRefreshToken] = await Promise.all([
      generateAccessToken(user.id, user.role),
      generateRefreshToken(user.id, familyId),
    ]);

    // 7. Store the new refresh token hash
    const newTokenHash = await hashToken(newRefreshToken);
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newTokenHash,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: ip,
        userAgent,
      },
    });

    // 8. Build response
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        accessToken: newAccessToken,
      },
    });

    // 9. Set cookies
    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60,
    });

    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60,
    });

    return response;
  } catch (error) {
    console.error('[auth/refresh]', error);

    if (isRecoverableDbError(error)) {
      return NextResponse.json(
        { error: 'Auth service temporarily unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function clearCookies(res: NextResponse) {
  res.cookies.set('accessToken', '', { path: '/', maxAge: 0 });
  res.cookies.set('refreshToken', '', { path: '/api/v1/auth', maxAge: 0 });
}
