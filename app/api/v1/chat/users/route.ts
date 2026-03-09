import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

// ─── GET /api/v1/chat/users ─────────────────────────
// Returns users available for chat.
// - ADMIN: gets all USERs
// - USER: gets all ADMINs
export async function GET(req: NextRequest) {
  try {
    const currentUser = await validateRequest(req);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const targetRole = currentUser.role === 'ADMIN' ? 'USER' : 'ADMIN';

    const users = await prisma.user.findMany({
      where: {
        role: targetRole,
        status: 'ACTIVE',
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        avatarUrl: true,
      },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('GET /chat/users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
