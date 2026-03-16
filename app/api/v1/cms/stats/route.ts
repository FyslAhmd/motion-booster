import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { defaultStats } from '@/lib/admin/store';
import { isRecoverableDbError } from '@/lib/server/db-error';

export async function GET() {
  try {
    const stats = await prisma.stat.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(stats);
  } catch (error) {
    console.error('GET /api/v1/cms/stats error:', error);

    if (isRecoverableDbError(error)) {
      return NextResponse.json(defaultStats);
    }

    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await prisma.stat.count();
    const stat = await prisma.stat.create({
      data: {
        value: body.value,
        title: body.title,
        description: body.description ?? '',
        bgColor: body.bgColor,
        valueColor: body.valueColor,
        order: count,
      },
    });
    return NextResponse.json(stat, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/cms/stats error:', error);
    return NextResponse.json({ error: 'Failed to create stat' }, { status: 500 });
  }
}
