import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';
import bcrypt from 'bcryptjs';
import { getClientIp, logActivity } from '@/lib/server/activity-history';

const ADMIN_SELECT = {
  id: true,
  username: true,
  email: true,
  fullName: true,
  phone: true,
  role: true,
  status: true,
  adminType: true,
  adsAccess: true,
  emailVerified: true,
  lastLoginAt: true,
  lastLoginIp: true,
  createdAt: true,
  updatedAt: true,
  avatarUrl: true,
} as const;

const PAGE_SIZE = 20;

type AdminTypeValue = 'BOOST_REQUEST' | 'SUPPORT_ADMIN' | 'OTHER_ADMIN';

const ADMIN_TYPES = new Set<AdminTypeValue>([
  'BOOST_REQUEST',
  'SUPPORT_ADMIN',
  'OTHER_ADMIN',
]);

function isAdminType(value: unknown): value is AdminTypeValue {
  return typeof value === 'string' && ADMIN_TYPES.has(value as AdminTypeValue);
}

async function recordAdminHistory(input: {
  adminId: string;
  action: string;
  req: NextRequest;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await logActivity({
      userId: input.adminId,
      eventType: 'CUSTOM_ACTION',
      action: input.action,
      path: input.req.nextUrl.pathname,
      method: input.req.method,
      ipAddress: getClientIp(input.req),
      userAgent: input.req.headers.get('user-agent'),
      metadata: {
        module: 'manage-admin',
        ...input.metadata,
      },
    });
  } catch (logErr) {
    console.error('[manage-admin history]', logErr);
  }
}

function isUniqueConstraintError(err: unknown): err is { code: 'P2002'; meta?: { target?: string[] } } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === 'P2002'
  );
}

// GET /api/v1/admin/manage-admin?page=1&search= — paginated admin list
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
      role: 'ADMIN' as const,
      ...(search ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { username:  { contains: search, mode: 'insensitive' as const } },
          { email:     { contains: search, mode: 'insensitive' as const } },
          { phone:     { contains: search } },
        ],
      } : {}),
    };

    const [admins, total, activeCount, suspendedCount, bannedCount, adsCount, totalAll] = await Promise.all([
      prisma.user.findMany({ where, select: ADMIN_SELECT, orderBy: { createdAt: 'desc' }, skip, take: PAGE_SIZE }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { role: 'ADMIN', status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'ADMIN', status: 'SUSPENDED' } }),
      prisma.user.count({ where: { role: 'ADMIN', status: 'BANNED' } }),
      prisma.user.count({ where: { role: 'ADMIN', adsAccess: true } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    return NextResponse.json({
      success: true,
      data: admins,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
      counts: { total: totalAll, active: activeCount, suspended: suspendedCount, banned: bannedCount, adsAccess: adsCount },
    });
  } catch (err) {
    console.error('[manage-admin GET]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch admins' }, { status: 500 });
  }
}

// PATCH /api/v1/admin/manage-admin — update any admin field
export async function PATCH(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, username, email, fullName, phone, status, adminType, adsAccess, emailVerified, newPassword } = body as {
      id: string;
      username?: string;
      email?: string;
      fullName?: string;
      phone?: string;
      status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
      adminType?: AdminTypeValue;
      adsAccess?: boolean;
      emailVerified?: boolean;
      newPassword?: string;
    };

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    if (newPassword !== undefined && newPassword.trim().length < 8) {
      return NextResponse.json({ success: false, error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    if (adminType !== undefined && !isAdminType(adminType)) {
      return NextResponse.json({ success: false, error: 'Invalid admin type' }, { status: 400 });
    }

    // Build update data — only include fields that were provided
    const data: Record<string, unknown> = {};
    if (username !== undefined) data.username = username.trim();
    if (email !== undefined) data.email = email.trim().toLowerCase();
    if (fullName !== undefined) data.fullName = fullName.trim();
    if (phone !== undefined) data.phone = phone.trim();
    if (status !== undefined) data.status = status;
    if (adminType !== undefined) data.adminType = adminType;
    if (adsAccess !== undefined) data.adsAccess = adsAccess;
    if (emailVerified !== undefined) data.emailVerified = emailVerified;
    if (newPassword !== undefined && newPassword.trim().length >= 8) {
      data.passwordHash = await bcrypt.hash(newPassword.trim(), 12);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'No fields to update' }, { status: 400 });
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        role: true,
        username: true,
        email: true,
        fullName: true,
        status: true,
        adminType: true,
        adsAccess: true,
        emailVerified: true,
      },
    });

    if (!existingAdmin) {
      return NextResponse.json({ success: false, error: 'Admin not found' }, { status: 404 });
    }

    if (existingAdmin.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'User is not an admin' }, { status: 400 });
    }

    const shouldRevokeSessions = status !== undefined && status !== 'ACTIVE';

    const updated = await prisma.$transaction(async (tx) => {
      const nextUser = await tx.user.update({
        where: { id },
        data,
        select: ADMIN_SELECT,
      });

      if (shouldRevokeSessions) {
        await tx.refreshToken.updateMany({
          where: { userId: id, isRevoked: false },
          data: { isRevoked: true },
        });
      }

      return nextUser;
    });

    const changeNotes: string[] = [];
    if (existingAdmin.adsAccess !== updated.adsAccess) {
      changeNotes.push(updated.adsAccess ? 'Ads Access ON' : 'Ads Access OFF');
    }
    if (existingAdmin.status !== updated.status) {
      changeNotes.push(`Status ${existingAdmin.status} -> ${updated.status}`);
    }
    if (existingAdmin.adminType !== updated.adminType) {
      changeNotes.push(`Type ${existingAdmin.adminType} -> ${updated.adminType}`);
    }
    if (existingAdmin.emailVerified !== updated.emailVerified) {
      changeNotes.push(updated.emailVerified ? 'Email Verified ON' : 'Email Verified OFF');
    }
    if (newPassword !== undefined) {
      changeNotes.push('Password updated');
    }
    if (
      (username !== undefined && username.trim() !== existingAdmin.username) ||
      (fullName !== undefined && fullName.trim() !== existingAdmin.fullName) ||
      (email !== undefined && email.trim().toLowerCase() !== existingAdmin.email)
    ) {
      changeNotes.push('Profile info updated');
    }

    const action =
      changeNotes.length > 0
        ? `Admin ${updated.username}: ${changeNotes.join(', ')}`
        : `Admin ${updated.username}: details updated`;

    await recordAdminHistory({
      adminId: auth.id,
      action,
      req,
      metadata: {
        actorAdminId: auth.id,
        actorAdminUsername: auth.username,
        actorAdminEmail: auth.email,
        managedAdminId: updated.id,
        managedAdminUsername: updated.username,
        managedAdminEmail: updated.email,
        managedAdminFullName: updated.fullName,
        managedAdminType: updated.adminType,
        changeNotes,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    // Handle unique constraint violations (duplicate email/username)
    if (isUniqueConstraintError(err)) {
      const field = err.meta?.target?.[0] || 'field';
      return NextResponse.json(
        { success: false, error: `This ${field} is already taken` },
        { status: 409 },
      );
    }
    console.error('[manage-admin PATCH]', err);
    return NextResponse.json({ success: false, error: 'Failed to update admin' }, { status: 500 });
  }
}

// DELETE /api/v1/admin/manage-admin — delete an admin
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

    // Allow deleting admins only; disallow deleting own account.
    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true, username: true, fullName: true, email: true, adminType: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'User is not an admin' }, { status: 403 });
    }
    if (id === auth.id) {
      return NextResponse.json({ success: false, error: 'You cannot delete your own admin account' }, { status: 403 });
    }

    const totalAdmins = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (totalAdmins <= 1) {
      return NextResponse.json({ success: false, error: 'At least one admin account must remain' }, { status: 403 });
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

    await recordAdminHistory({
      adminId: auth.id,
      action: `Admin ${user.username} deleted`,
      req,
      metadata: {
        actorAdminId: auth.id,
        actorAdminUsername: auth.username,
        actorAdminEmail: auth.email,
        deletedAdminId: id,
        deletedAdminUsername: user.username,
        deletedAdminEmail: user.email,
        deletedAdminFullName: user.fullName,
        deletedAdminType: user.adminType,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[manage-admin DELETE]', err);
    return NextResponse.json({ success: false, error: 'Failed to delete admin' }, { status: 500 });
  }
}
