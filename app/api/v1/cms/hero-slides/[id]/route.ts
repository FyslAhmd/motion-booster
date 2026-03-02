import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { image, customImage, title, description, badge, ctaText, ctaLink } = body;

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        image: image || '/header1.jpeg',
        customImage: customImage || null,
        title: (title || '').trim() || 'Slide',
        description: description || '',
        badge: badge || null,
        ctaText: ctaText || null,
        ctaLink: ctaLink || null,
      },
    });

    return NextResponse.json(slide);
  } catch (error) {
    console.error('[CMS hero-slides PUT]', error);
    return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.heroSlide.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CMS hero-slides DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
  }
}
