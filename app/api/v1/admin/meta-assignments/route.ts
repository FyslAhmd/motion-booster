import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';
import { Prisma } from '@/lib/generated/prisma';
import { getClientIp, logActivity } from '@/lib/server/activity-history';

async function recordMetaAssignmentHistory(input: {
  req: NextRequest;
  adminId: string;
  adminUsername: string;
  adminEmail: string;
  action: string;
  metadata: Record<string, unknown>;
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
        module: 'meta-assignments',
        actorAdminId: input.adminId,
        actorAdminUsername: input.adminUsername,
        actorAdminEmail: input.adminEmail,
        ...input.metadata,
      },
    });
  } catch (logErr) {
    console.error('[meta-assignments history]', logErr);
  }
}

async function createAssignmentNotifications(input: {
  req: NextRequest;
  adminId: string;
  adminUsername: string;
  adminEmail: string;
  userId: string;
  userFullName: string;
  userUsername: string;
  metaObjectId: string;
  metaObjectType: 'CAMPAIGN' | 'ADSET' | 'AD';
  metaAccountId: string;
}): Promise<void> {
  const objectLabel =
    input.metaObjectType === 'CAMPAIGN'
      ? 'Campaign'
      : input.metaObjectType === 'ADSET'
        ? 'Ad Set'
        : 'Ad';

  try {
    await logActivity({
      userId: input.userId,
      eventType: 'CUSTOM_ACTION',
      action: 'Notification: New assignment received',
      path: '/dashboard/my-campaigns',
      method: 'SYSTEM',
      ipAddress: getClientIp(input.req),
      userAgent: input.req.headers.get('user-agent'),
      metadata: {
        module: 'notifications',
        type: 'ASSIGNMENT',
        title: 'New assignment received',
        text: `${objectLabel} ${input.metaObjectId} was assigned to you by ${input.adminUsername}.`,
        href: '/dashboard/my-campaigns',
        targetUserId: input.userId,
        targetUserFullName: input.userFullName,
        targetUserUsername: input.userUsername,
        assignedByAdminId: input.adminId,
        assignedByAdminUsername: input.adminUsername,
        assignedByAdminEmail: input.adminEmail,
        metaObjectId: input.metaObjectId,
        metaObjectType: input.metaObjectType,
        metaAccountId: input.metaAccountId,
      },
    });

    await logActivity({
      userId: input.adminId,
      eventType: 'CUSTOM_ACTION',
      action: 'Notification: Assignment completed',
      path: input.req.nextUrl.pathname,
      method: input.req.method,
      ipAddress: getClientIp(input.req),
      userAgent: input.req.headers.get('user-agent'),
      metadata: {
        module: 'notifications',
        type: 'ASSIGNMENT',
        title: 'Assignment completed',
        text: `${objectLabel} ${input.metaObjectId} assigned to ${input.userFullName}.`,
        href: '/dashboard/user-campaigns',
        targetUserId: input.userId,
        targetUserFullName: input.userFullName,
        targetUserUsername: input.userUsername,
        assignedByAdminId: input.adminId,
        assignedByAdminUsername: input.adminUsername,
        assignedByAdminEmail: input.adminEmail,
        metaObjectId: input.metaObjectId,
        metaObjectType: input.metaObjectType,
        metaAccountId: input.metaAccountId,
      },
    });
  } catch (error) {
    console.error('[meta-assignments notifications]', error);
  }
}

/**
 * GET /api/v1/admin/meta-assignments?account_id=act_xxx&type=CAMPAIGN
 * Returns all assignments for the given Meta account, optionally filtered by type.
 * Also accepts ?object_ids=id1,id2,id3 to get assignments for specific Meta entities.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('account_id');
    const type = searchParams.get('type') as 'CAMPAIGN' | 'ADSET' | 'AD' | null;
    const objectIds = searchParams.get('object_ids')?.split(',').filter(Boolean);

    const where: Record<string, unknown> = {};
    if (accountId) where.metaAccountId = accountId;
    if (type) where.metaObjectType = type;
    if (objectIds?.length) where.metaObjectId = { in: objectIds };

    const assignments = await prisma.metaAdAssignment.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, phone: true, username: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: assignments });
  } catch (err) {
    console.error('[meta-assignments GET]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

/**
 * POST /api/v1/admin/meta-assignments
 * Body: { metaObjectId, metaObjectType, metaAccountId, userId }
 * Creates an assignment between a Meta object and a user.
 * Duplicate assignments for the same object+user are ignored.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { metaObjectId, metaObjectType, metaAccountId, userId } = body as {
      metaObjectId: string;
      metaObjectType: 'CAMPAIGN' | 'ADSET' | 'AD';
      metaAccountId: string;
      userId: string;
    };

    if (!metaObjectId || !metaObjectType || !metaAccountId || !userId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Validate type
    if (!['CAMPAIGN', 'ADSET', 'AD'].includes(metaObjectType)) {
      return NextResponse.json({ success: false, error: 'Invalid metaObjectType' }, { status: 400 });
    }

    // Verify user exists and is not admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, username: true, fullName: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    if (user.role === 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Cannot assign to admin users' }, { status: 400 });
    }

    const existing = await prisma.metaAdAssignment.findFirst({
      where: { metaObjectId, metaObjectType, userId },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true, username: true },
        },
      },
    });

    const assignment = existing ?? await prisma.metaAdAssignment.create({
      data: {
        metaObjectId,
        metaObjectType,
        metaAccountId,
        userId,
      },
      include: {
        user: {
          select: { id: true, fullName: true, phone: true, username: true },
        },
      },
    });

    await recordMetaAssignmentHistory({
      req,
      adminId: auth.id,
      adminUsername: auth.username,
      adminEmail: auth.email,
      action: existing
        ? `Assignment already existed for ${user.username}`
        : `Assigned ${metaObjectType} to ${user.username}`,
      metadata: {
        targetUserId: user.id,
        targetUserUsername: user.username,
        targetUserFullName: user.fullName,
        targetUserEmail: user.email,
        metaObjectId,
        metaObjectType,
        metaAccountId,
        isExisting: Boolean(existing),
      },
    });

    if (!existing) {
      await createAssignmentNotifications({
        req,
        adminId: auth.id,
        adminUsername: auth.username,
        adminEmail: auth.email,
        userId: user.id,
        userFullName: user.fullName,
        userUsername: user.username,
        metaObjectId,
        metaObjectType,
        metaAccountId,
      });
    }

    return NextResponse.json({ success: true, data: assignment });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002' &&
      Array.isArray(err.meta?.target) &&
      err.meta.target.includes('meta_object_id')
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Database schema is still using legacy single-assignment constraint. Run Prisma migration to allow multiple users per campaign.',
          code: 'LEGACY_UNIQUE_META_OBJECT_ID',
        },
        { status: 409 },
      );
    }
    console.error('[meta-assignments POST]', err);
    return NextResponse.json({ success: false, error: 'Failed to save assignment' }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/admin/meta-assignments
 * Body: { metaObjectId, userId? }
 * Removes one assignment for a specific user if userId is provided,
 * otherwise removes all assignments for the Meta object.
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { metaObjectId, userId } = body as { metaObjectId: string; userId?: string };

    if (!metaObjectId) {
      return NextResponse.json({ success: false, error: 'Missing metaObjectId' }, { status: 400 });
    }

    const toDelete = await prisma.metaAdAssignment.findMany({
      where: {
        metaObjectId,
        ...(userId ? { userId } : {}),
      },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, email: true },
        },
      },
    });

    await prisma.metaAdAssignment.deleteMany({
      where: {
        metaObjectId,
        ...(userId ? { userId } : {}),
      },
    });

    for (const row of toDelete) {
      await recordMetaAssignmentHistory({
        req,
        adminId: auth.id,
        adminUsername: auth.username,
        adminEmail: auth.email,
        action: `Unassigned ${row.metaObjectType} from ${row.user?.username || row.userId}`,
        metadata: {
          targetUserId: row.user?.id || row.userId,
          targetUserUsername: row.user?.username || null,
          targetUserFullName: row.user?.fullName || null,
          targetUserEmail: row.user?.email || null,
          metaObjectId: row.metaObjectId,
          metaObjectType: row.metaObjectType,
          metaAccountId: row.metaAccountId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[meta-assignments DELETE]', err);
    return NextResponse.json({ success: false, error: 'Failed to remove assignment' }, { status: 500 });
  }
}
