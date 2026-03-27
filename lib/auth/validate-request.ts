import { NextRequest } from 'next/server';
import { verifyAccessToken, type AccessTokenPayload } from './tokens';
import { prisma } from '@/lib/db/prisma';
import { getClientIp, logActivity } from '@/lib/server/activity-history';

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

/**
 * Extract and verify the JWT from the Authorization header or accessToken cookie.
 * Returns the authenticated user or null.
 */
export async function validateRequest(
  req: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    // Try Authorization header first, then fall back to cookie
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies.get('accessToken')?.value;

    if (!token) return null;
    const payload: AccessTokenPayload = await verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') return null;

    const path = req.nextUrl.pathname;
    const skipLogging =
      path === '/api/v1/history/track' ||
      path === '/api/v1/admin/history';

    if (!skipLogging && path.startsWith('/api/')) {
      void logActivity({
        userId: user.id,
        eventType: 'API_REQUEST',
        action: `API ${req.method}`,
        path,
        method: req.method,
        ipAddress: getClientIp(req),
        userAgent: req.headers.get('user-agent'),
      }).catch(() => {
        // Do not block request auth flow for logging failures.
      });
    }

    return user;
  } catch {
    return null;
  }
}
