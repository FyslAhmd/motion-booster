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
    const {
      title,
      titleBn,
      description,
      descriptionBn,
      gradient,
      category,
      categoryBn,
      slug,
      image,
      customImage,
      services,
      servicesBn,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const finalSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();

    const service = await prisma.popularService.update({
      where: { id },
      data: {
        title: title.trim(),
        titleBn: titleBn?.trim() || null,
        description: description || '',
        descriptionBn: descriptionBn?.trim() || null,
        gradient: gradient || 'from-green-700 via-green-600 to-emerald-500',
        category: category || '',
        categoryBn: categoryBn?.trim() || null,
        slug: finalSlug,
        image: image || '/service-digital-marketing.jpg',
        customImage: customImage || null,
        services: Array.isArray(services) ? services.filter((s: string) => s.trim()) : [],
        servicesBn: Array.isArray(servicesBn) ? servicesBn.filter((s: string) => s.trim()) : [],
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('[CMS popular-services PUT]', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.popularService.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CMS popular-services DELETE]', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
