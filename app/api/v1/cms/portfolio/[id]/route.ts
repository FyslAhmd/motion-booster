import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const item = await prisma.portfolioItem.update({
      where: { id },
      data: {
        title: body.title,
        category: body.category,
        description: body.description,
        client: body.client,
        result: body.result,
        tags: body.tags,
        coverColor: body.coverColor,
        coverImage: body.coverImage ?? null,
        featured: body.featured,
        order: body.order,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('PUT /api/v1/cms/portfolio/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update portfolio item' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.portfolioItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/v1/cms/portfolio/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 });
  }
}
