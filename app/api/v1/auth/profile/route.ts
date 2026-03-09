import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

/**
 * PATCH /api/v1/auth/profile
 * Update the authenticated user's profile (fullName, username, phone).
 * Body: { fullName?, username?, phone? }
 */
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await validateRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    let body: { fullName?: string; username?: string; phone?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    }

    const { fullName, username, phone } = body;

    // Validate at least one field is provided
    if (!fullName && !username && !phone) {
      return NextResponse.json({ success: false, error: 'Nothing to update' }, { status: 400 });
    }

    // Validate non-empty strings
    if (fullName !== undefined && fullName.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Full name must be at least 2 characters' }, { status: 400 });
    }
    if (username !== undefined && !/^[a-zA-Z0-9_]{3,30}$/.test(username.trim())) {
      return NextResponse.json({ success: false, error: 'Username must be 3–30 characters (letters, numbers, underscores)' }, { status: 400 });
    }
    if (phone !== undefined && phone.trim().length < 7) {
      return NextResponse.json({ success: false, error: 'Invalid phone number' }, { status: 400 });
    }

    // Check uniqueness for username / phone if they changed
    if (username && username.trim() !== authUser.username) {
      const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Username is already taken' }, { status: 409 });
      }
    }
    if (phone) {
      const existing = await prisma.user.findFirst({
        where: { phone: phone.trim(), NOT: { id: authUser.id } },
      });
      if (existing) {
        return NextResponse.json({ success: false, error: 'Phone number is already in use' }, { status: 409 });
      }
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        ...(fullName ? { fullName: fullName.trim() } : {}),
        ...(username ? { username: username.trim() } : {}),
        ...(phone ? { phone: phone.trim() } : {}),
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ success: true, data: { user: updated } });
  } catch (err: any) {
    console.error('[auth/profile]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
