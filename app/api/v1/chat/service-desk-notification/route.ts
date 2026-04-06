import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';
import { createNotification } from '@/lib/server/notifications';
import { getClientIp } from '@/lib/server/activity-history';

const TOPIC_CONFIG = {
  'boost-request': {
    adminType: 'BOOST_REQUEST',
    label: 'Boost Request',
  },
  support: {
    adminType: 'SUPPORT_ADMIN',
    label: 'Support',
  },
  others: {
    adminType: 'OTHER_ADMIN',
    label: 'Other',
  },
} as const;

type ServiceDeskTopicId = keyof typeof TOPIC_CONFIG;

function isServiceDeskTopicId(value: unknown): value is ServiceDeskTopicId {
  return typeof value === 'string' && value in TOPIC_CONFIG;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.role !== 'USER') {
      return NextResponse.json(
        { success: false, error: 'Only users can trigger service desk notifications' },
        { status: 403 },
      );
    }

    const body = (await req.json()) as { topicId?: unknown };
    const topicId = body.topicId;

    if (!isServiceDeskTopicId(topicId)) {
      return NextResponse.json({ success: false, error: 'Invalid topic id' }, { status: 400 });
    }

    const topic = TOPIC_CONFIG[topicId];

    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        status: 'ACTIVE',
        adminType: topic.adminType,
      },
      select: {
        id: true,
      },
    });

    if (admins.length === 0) {
      return NextResponse.json({ success: true, notifiedCount: 0, topicId, adminType: topic.adminType });
    }

    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: 'GENERAL',
          title: `${topic.label} chat request`,
          text: `${auth.fullName} selected ${topic.label} in live chat and needs assistance.`,
          href: '/dashboard/chat',
          logPath: req.nextUrl.pathname,
          logMethod: req.method,
          logIpAddress: getClientIp(req),
          logUserAgent: req.headers.get('user-agent'),
          metadata: {
            module: 'chat',
            type: 'SERVICE_DESK_TOPIC',
            topicId,
            topicLabel: topic.label,
            targetAdminType: topic.adminType,
            requesterUserId: auth.id,
            requesterUsername: auth.username,
            requesterEmail: auth.email,
            requesterFullName: auth.fullName,
          },
        }),
      ),
    );

    return NextResponse.json({
      success: true,
      notifiedCount: admins.length,
      topicId,
      adminType: topic.adminType,
    });
  } catch (error) {
    console.error('[chat service-desk-notification POST]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to notify admins for selected topic' },
      { status: 500 },
    );
  }
}
