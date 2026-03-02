import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { verifyAccessToken, hashToken } from '@/lib/auth/tokens';

/**
 * POST /api/v1/auth/logout
 *
 * Revokes the current refresh token family, clears all auth cookies.
 */
export async function POST(request: NextRequest) {
  try {
    // Revoke refresh tokens if we can identify the user
    const accessToken = request.cookies.get('accessToken')?.value;
    if (accessToken) {
      try {
        const payload = await verifyAccessToken(accessToken);
        // Revoke all refresh tokens for this user
        await prisma.refreshToken.updateMany({
          where: { userId: payload.userId, isRevoked: false },
          data: { isRevoked: true },
        });
      } catch {
        // Token might be expired — try revoking via refresh token
      }
    }

    // Also try to revoke via refresh token cookie
    const refreshToken = request.cookies.get('refreshToken')?.value;
    if (refreshToken) {
      try {
        const tokenHash = await hashToken(refreshToken);
        const stored = await prisma.refreshToken.findFirst({
          where: { tokenHash },
        });
        if (stored) {
          await prisma.refreshToken.updateMany({
            where: { familyId: stored.familyId },
            data: { isRevoked: true },
          });
        }
      } catch {
        // Best effort
      }
    }

    // Clear all auth cookies
    const response = NextResponse.json({ success: true, message: 'Logged out' });
    response.cookies.set('accessToken', '', { path: '/', maxAge: 0 });
    response.cookies.set('refreshToken', '', { path: '/api/v1/auth', maxAge: 0 });

    return response;
  } catch (error) {
    console.error('[auth/logout]', error);
    // Even on error, clear cookies
    const response = NextResponse.json({ success: true });
    response.cookies.set('accessToken', '', { path: '/', maxAge: 0 });
    response.cookies.set('refreshToken', '', { path: '/api/v1/auth', maxAge: 0 });
    return response;
  }
}
