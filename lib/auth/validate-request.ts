import { NextRequest } from 'next/server';
import { verifyAccessToken, type AccessTokenPayload } from './tokens';
import { prisma } from '@/lib/db/prisma';

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
}

/**
 * Extract and verify the JWT from the Authorization header.
 * Returns the authenticated user or null.
 */
export async function validateRequest(
  req: NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.slice(7);
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

    return user;
  } catch {
    return null;
  }
}
