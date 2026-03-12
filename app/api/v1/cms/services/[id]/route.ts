import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const service = await prisma.service.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        iconColor: body.iconColor,
        iconType: body.iconType,
        order: body.order,
      },
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error('[CMS services PUT]', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CMS services DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
