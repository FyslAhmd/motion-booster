export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { image, customImage, title, titleBn, description, descriptionBn, badge, badgeBn, ctaText, ctaTextBn, ctaLink } = body;

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        image: image || '/header1.jpeg',
        customImage: customImage || null,
        title: (title || '').trim() || 'Slide',
        titleBn: titleBn?.trim() || null,
        description: description || '',
        descriptionBn: descriptionBn?.trim() || null,
        badge: badge || null,
        badgeBn: badgeBn?.trim() || null,
        ctaText: ctaText || null,
        ctaTextBn: ctaTextBn?.trim() || null,
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
