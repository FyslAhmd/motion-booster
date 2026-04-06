import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';
import { metaPost } from '@/lib/meta/client';
import { invalidateCache } from '@/lib/meta/cache';
import { createNotification } from '@/lib/server/notifications';
import { getClientIp } from '@/lib/server/activity-history';

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value || '');
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const state = (searchParams.get('state') || 'PENDING').trim().toUpperCase();
    const requestedStatus = (searchParams.get('requestedStatus') || 'ALL').trim().toUpperCase();
    const page = parsePositiveInt(searchParams.get('page'), 1);
    const limit = Math.min(parsePositiveInt(searchParams.get('limit'), 20), 100);

    const where: any = {};

    if (state !== 'ALL') {
      where.state = state;
    }

    if (requestedStatus !== 'ALL') {
      where.requestedStatus = requestedStatus;
    }

    if (search) {
      where.OR = [
        { metaObjectName: { contains: search, mode: 'insensitive' } },
        { metaObjectId: { contains: search, mode: 'insensitive' } },
        { requesterUser: { fullName: { contains: search, mode: 'insensitive' } } },
        { requesterUser: { username: { contains: search, mode: 'insensitive' } } },
        { requesterUser: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, rows] = await Promise.all([
      prisma.metaStatusRequest.count({ where }),
      prisma.metaStatusRequest.findMany({
        where,
        orderBy: [{ state: 'asc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          requesterUser: {
            select: {
              id: true,
              fullName: true,
              username: true,
              email: true,
            },
          },
          reviewedByAdmin: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('[admin/meta-status-requests GET]', error);
    return NextResponse.json({ success: false, error: 'Failed to load status requests' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const requestId = typeof body?.requestId === 'string' ? body.requestId : '';
    const decision = typeof body?.decision === 'string' ? body.decision.toUpperCase() : '';
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : '';

    if (!requestId || !['APPROVE', 'REJECT'].includes(decision)) {
      return NextResponse.json({ success: false, error: 'Invalid request payload' }, { status: 400 });
    }

    const existing = await prisma.metaStatusRequest.findUnique({
      where: { id: requestId },
      include: {
        requesterUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    if (existing.state !== 'PENDING') {
      return NextResponse.json({ success: false, error: 'Request is already reviewed' }, { status: 409 });
    }

    if (decision === 'APPROVE') {
      await metaPost(`/${existing.metaObjectId}`, { status: existing.requestedStatus });
      invalidateCache('meta:page:');
      invalidateCache('meta:campaign-names:');
    }

    const nextState = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const updated = await prisma.metaStatusRequest.update({
      where: { id: requestId },
      data: {
        state: nextState,
        reviewedAt: new Date(),
        reviewedByAdminId: auth.id,
        reason: reason || null,
      },
      include: {
        requesterUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
            email: true,
          },
        },
        reviewedByAdmin: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    const objectLabel = existing.metaObjectType === 'CAMPAIGN'
      ? 'Campaign'
      : existing.metaObjectType === 'ADSET'
        ? 'Ad Set'
        : 'Ad';

    const title = nextState === 'APPROVED'
      ? `${objectLabel} activation approved`
      : `${objectLabel} activation rejected`;

    const text = nextState === 'APPROVED'
      ? `Your request to activate ${objectLabel.toLowerCase()} ${existing.metaObjectName} was approved.`
      : `Your request to activate ${objectLabel.toLowerCase()} ${existing.metaObjectName} was rejected.`;

    await createNotification({
      userId: existing.requesterUserId,
      type: 'GENERAL',
      title,
      text,
      href: '/dashboard/my-campaigns',
      logPath: req.nextUrl.pathname,
      logMethod: req.method,
      logIpAddress: getClientIp(req),
      logUserAgent: req.headers.get('user-agent'),
      metadata: {
        requestId: existing.id,
        decision: nextState,
        reviewedByAdminId: auth.id,
        reviewedByAdminUsername: auth.username,
        reviewedByAdminEmail: auth.email,
        metaObjectId: existing.metaObjectId,
        metaObjectType: existing.metaObjectType,
        metaObjectName: existing.metaObjectName,
        reason: reason || null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('[admin/meta-status-requests PATCH]', error);
    return NextResponse.json({ success: false, error: 'Failed to update request' }, { status: 500 });
  }
}
