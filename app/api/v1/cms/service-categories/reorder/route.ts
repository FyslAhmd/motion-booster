export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: 'ids must be an array' }, { status: 400 });
    }

    await prisma.$transaction(
      ids.map((id: string, index: number) =>
        prisma.serviceCategory.update({ where: { id }, data: { order: index } })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CMS service-categories reorder]', error);
    return NextResponse.json({ error: 'Failed to reorder categories' }, { status: 500 });
  }
}
