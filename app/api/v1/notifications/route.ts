import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';
import { metaFetch } from '@/lib/meta/client';

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

    const objectNameCache = new Map<string, string>();

    const resolveObjectName = async (metadata: {
      metaObjectId?: string;
      metaObjectName?: string;
    }): Promise<string | null> => {
      const preferredName = metadata.metaObjectName?.trim();
      if (preferredName) return preferredName;

      const objectId = metadata.metaObjectId?.trim();
      if (!objectId) return null;

      const cached = objectNameCache.get(objectId);
      if (cached) return cached;

      try {
        const result = await metaFetch<{ name?: string }>(`/${objectId}`, { fields: 'name' });
        const resolved = result?.name?.trim();
        if (!resolved) return null;
        objectNameCache.set(objectId, resolved);
        return resolved;
      } catch {
        return null;
      }
    };

    const notifications = await Promise.all(rows.map(async (row) => {
      const metadata = (row.metadata ?? {}) as {
        title?: string;
        text?: string;
        href?: string;
        type?: string;
        metaObjectType?: 'CAMPAIGN' | 'ADSET' | 'AD';
        metaObjectId?: string;
        metaObjectName?: string;
      };

      let title =
        typeof metadata.title === 'string' && metadata.title.trim().length > 0
          ? metadata.title
          : row.action.replace(/^Notification:\s*/, '') || 'Notification';

      // Backward compatibility for older assignment rows with generic titles.
      if (metadata.type === 'ASSIGNMENT' && title.toLowerCase() === 'new assignment received') {
        if (metadata.metaObjectType === 'CAMPAIGN') title = 'Campaign assignment update';
        else if (metadata.metaObjectType === 'ADSET') title = 'Ad Set assignment update';
        else if (metadata.metaObjectType === 'AD') title = 'Ad assignment update';
        else title = 'Assignment update';
      }

      let text =
        typeof metadata.text === 'string' && metadata.text.trim().length > 0
          ? metadata.text
          : 'You have a new update.';

      if (metadata.type === 'ASSIGNMENT') {
        const objectName = await resolveObjectName(metadata);
        const objectId = metadata.metaObjectId?.trim();
        if (objectName && objectId) {
          text = text.replace(objectId, objectName);
        }
      }

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
    }));

    return NextResponse.json({ success: true, data: notifications });
  } catch (error) {
    console.error('[notifications GET]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load notifications' },
      { status: 500 }
    );
  }
}
