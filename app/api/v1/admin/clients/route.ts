import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

const CLIENT_SELECT = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  phone: true,
  role: true,
  status: true,
  adsAccess: true,
  emailVerified: true,
  lastLoginAt: true,
  lastLoginIp: true,
  createdAt: true,
  updatedAt: true,
  avatarUrl: true,
} as const;

const PAGE_SIZE = 20;

// GET /api/v1/admin/clients?page=1&search= — paginated client list
export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const page   = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const skip   = (page - 1) * PAGE_SIZE;

    const where = {
      role: 'USER' as const,
      ...(search ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { username:  { contains: search, mode: 'insensitive' as const } },
          { email:     { contains: search, mode: 'insensitive' as const } },
          { phone:     { contains: search } },
        ],
      } : {}),
    };

    const [clients, total, activeCount, suspendedCount, adsCount, totalAll] = await Promise.all([
      prisma.user.findMany({ where, select: CLIENT_SELECT, orderBy: { createdAt: 'desc' }, skip, take: PAGE_SIZE }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { role: 'USER', status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'USER', status: 'SUSPENDED' } }),
      prisma.user.count({ where: { role: 'USER', adsAccess: true } }),
      prisma.user.count({ where: { role: 'USER' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: clients,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
      counts: { total: totalAll, active: activeCount, suspended: suspendedCount, adsAccess: adsCount },
    });
  } catch (err) {
    console.error('[admin clients GET]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch clients' }, { status: 500 });
  }
}

// PATCH /api/v1/admin/clients — update any client field (except password)
export async function PATCH(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, username, email, fullName, phone, status, adsAccess, emailVerified } = body as {
      id: string;
      username?: string;
      email?: string;
      fullName?: string;
      phone?: string;
      status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
      adsAccess?: boolean;
      emailVerified?: boolean;
    };

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    // Build update data — only include fields that were provided
    const data: Record<string, unknown> = {};
    if (username !== undefined) data.username = username.trim();
    if (email !== undefined) data.email = email.trim().toLowerCase();
    if (fullName !== undefined) data.fullName = fullName.trim();
    if (phone !== undefined) data.phone = phone.trim();
    if (status !== undefined) data.status = status;
    if (adsAccess !== undefined) data.adsAccess = adsAccess;
    if (emailVerified !== undefined) data.emailVerified = emailVerified;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: CLIENT_SELECT,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    // Handle unique constraint violations (duplicate email/username)
    if (err?.code === 'P2002') {
      const field = err.meta?.target?.[0] || 'field';
      return NextResponse.json(
        { success: false, error: `This ${field} is already taken` },
        { status: 409 },
      );
    }
    console.error('[admin clients PATCH]', err);
    return NextResponse.json({ success: false, error: 'Failed to update client' }, { status: 500 });
  }
}

// DELETE /api/v1/admin/clients — delete a client
export async function DELETE(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = (await req.json()) as { id: string };
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    // Prevent deleting admin accounts
    const user = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    if (user.role === 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Cannot delete admin users' }, { status: 403 });
    }

    // Delete related refresh tokens first, then the user
    // RefreshToken and Message have onDelete: Cascade, but we need to
    // disconnect the implicit many-to-many conversation participants
    await prisma.refreshToken.deleteMany({ where: { userId: id } });

    // Disconnect user from all conversations
    const convos = await prisma.conversation.findMany({
      where: { participants: { some: { id } } },
      select: { id: true },
    });
    for (const c of convos) {
      await prisma.conversation.update({
        where: { id: c.id },
        data: { participants: { disconnect: { id } } },
      });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin clients DELETE]', err);
    return NextResponse.json({ success: false, error: 'Failed to delete client' }, { status: 500 });
  }
}
