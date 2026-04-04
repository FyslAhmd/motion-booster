import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parsedLimit = Number(searchParams.get('limit') || '20');
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 50)
      : 20;

    const rows = await prisma.activityHistory.findMany({
      where: {
        userId: auth.id,
        eventType: 'CUSTOM_ACTION',
        action: {
          startsWith: 'Notification:',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        action: true,
        metadata: true,
        createdAt: true,
      },
    });

    const notifications = rows.map((row) => {
      const metadata = (row.metadata ?? {}) as {
        title?: string;
        text?: string;
        href?: string;
        type?: string;
      };

      const title =
        typeof metadata.title === 'string' && metadata.title.trim().length > 0
          ? metadata.title
          : row.action.replace(/^Notification:\s*/, '') || 'Notification';

      const text =
        typeof metadata.text === 'string' && metadata.text.trim().length > 0
          ? metadata.text
          : 'You have a new update.';

      const href =
        typeof metadata.href === 'string' && metadata.href.trim().length > 0
          ? metadata.href
          : '/dashboard';

      const type =
        typeof metadata.type === 'string' && metadata.type.trim().length > 0
          ? metadata.type
          : 'GENERAL';

      return {
        id: row.id,
        title,
        text,
        href,
        type,
        createdAt: row.createdAt,
      };
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('[notifications GET]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load notifications' },
      { status: 500 }
    );
  }
}
