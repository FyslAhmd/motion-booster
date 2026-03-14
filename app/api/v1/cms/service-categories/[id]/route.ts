import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/lib/generated/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, slug, iconType, iconColor, iconBg, logoImage } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const finalSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();
    if (!finalSlug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const duplicate = await prisma.serviceCategory.findFirst({
      where: {
        slug: finalSlug,
        id: { not: id },
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: {
        title: title.trim(),
        slug: finalSlug,
        iconType: iconType || 'layers',
        iconColor: iconColor || 'text-blue-600',
        iconBg: iconBg || 'bg-blue-50',
        logoImage: logoImage || null,
      },
    });

    return NextResponse.json(category);
  } catch (error: unknown) {
    console.error('[CMS service-categories PUT]', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      }

      if (error.code === 'P2022') {
        return NextResponse.json(
          { error: 'Database schema is out of date. Run Prisma migrations on this environment.' },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.serviceCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[CMS service-categories DELETE]', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2022') {
      return NextResponse.json(
        { error: 'Database schema is out of date. Run Prisma migrations on this environment.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
