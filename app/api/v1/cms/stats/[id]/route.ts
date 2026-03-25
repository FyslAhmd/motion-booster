export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const stat = await prisma.stat.update({
      where: { id },
      data: {
        value: body.value,
        title: body.title,
        titleBn: body.titleBn?.trim() || null,
        description: body.description,
        descriptionBn: body.descriptionBn?.trim() || null,
        bgColor: body.bgColor,
        valueColor: body.valueColor,
        order: body.order,
      },
    });
    return NextResponse.json(stat);
  } catch (error) {
    console.error('PUT /api/v1/cms/stats/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update stat' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.stat.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/v1/cms/stats/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete stat' }, { status: 500 });
  }
}
