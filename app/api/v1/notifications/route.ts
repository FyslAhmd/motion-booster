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

    const rows = await prisma.notification.findMany({
      where: {
        userId: auth.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        text: true,
        href: true,
        metadata: true,
        createdAt: true,
      },
    });

    const notifications = rows.map((row) => ({
      id: row.id,
      title: row.title,
      text: row.text,
      href: row.href || '/dashboard',
      type: row.type,
      metadata: row.metadata,
      createdAt: row.createdAt,
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
