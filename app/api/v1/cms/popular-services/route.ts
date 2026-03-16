import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { defaultPopularServices } from '@/lib/admin/store';
import { isRecoverableDbError } from '@/lib/server/db-error';

export async function GET() {
  try {
    const services = await prisma.popularService.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(services);
  } catch (error) {
    console.error('[CMS popular-services GET]', error);

    if (isRecoverableDbError(error)) {
      return NextResponse.json(defaultPopularServices);
    }

    return NextResponse.json({ error: 'Failed to load services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, gradient, category, slug, image, customImage, services } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const finalSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();
    const count = await prisma.popularService.count();

    const service = await prisma.popularService.create({
      data: {
        title: title.trim(),
        description: description || '',
        gradient: gradient || 'from-green-700 via-green-600 to-emerald-500',
        category: category || '',
        slug: finalSlug,
        image: image || '/service-digital-marketing.jpg',
        customImage: customImage || null,
        services: Array.isArray(services) ? services.filter((s: string) => s.trim()) : [],
        order: count,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error: unknown) {
    console.error('[CMS popular-services POST]', error);
    const msg = error instanceof Error && error.message.includes('Unique constraint')
      ? 'Slug already exists'
      : 'Failed to create service';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
