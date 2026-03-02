import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

const DEFAULT_CATEGORIES = [
  { title: 'Digital Marketing',     slug: 'digital-marketing',     iconType: 'trending-up', iconColor: 'text-green-600',  iconBg: 'bg-green-50',  order: 0 },
  { title: 'Graphics Design',       slug: 'graphics-design',       iconType: 'palette',     iconColor: 'text-purple-600', iconBg: 'bg-purple-50', order: 1 },
  { title: 'Software Development',  slug: 'software-development',  iconType: 'code',        iconColor: 'text-blue-600',   iconBg: 'bg-blue-50',   order: 2 },
  { title: 'Web Development',       slug: 'web-development',       iconType: 'globe',       iconColor: 'text-cyan-600',   iconBg: 'bg-cyan-50',   order: 3 },
  { title: 'Mobile App Development',slug: 'mobile-app-development',iconType: 'smartphone',  iconColor: 'text-pink-600',   iconBg: 'bg-pink-50',   order: 4 },
  { title: 'UI/UX Design',          slug: 'ui-ux-design',          iconType: 'layers',      iconColor: 'text-orange-500', iconBg: 'bg-orange-50', order: 5 },
  { title: 'Branding & Creative',   slug: 'branding-creative',     iconType: 'sparkles',    iconColor: 'text-yellow-600', iconBg: 'bg-yellow-50', order: 6 },
  { title: 'Video & Animation',     slug: 'video-animation',       iconType: 'video',       iconColor: 'text-red-500',    iconBg: 'bg-red-50',    order: 7 },
  { title: 'Business Consulting',   slug: 'business-consulting',   iconType: 'briefcase',   iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50', order: 8 },
  { title: 'Specialized Services',  slug: 'specialized-services',  iconType: 'zap',         iconColor: 'text-teal-600',   iconBg: 'bg-teal-50',   order: 9 },
];

export async function GET() {
  try {
    let categories = await prisma.serviceCategory.findMany({ orderBy: { order: 'asc' } });

    if (categories.length === 0) {
      await prisma.serviceCategory.createMany({ data: DEFAULT_CATEGORIES, skipDuplicates: true });
      categories = await prisma.serviceCategory.findMany({ orderBy: { order: 'asc' } });
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('[CMS service-categories GET]', error);
    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, iconType, iconColor, iconBg } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const finalSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();
    const count = await prisma.serviceCategory.count();

    const category = await prisma.serviceCategory.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        iconType: iconType || 'layers',
        iconColor: iconColor || 'text-blue-600',
        iconBg: iconBg || 'bg-blue-50',
        order: count,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    console.error('[CMS service-categories POST]', error);
    const msg = error instanceof Error && error.message.includes('Unique constraint')
      ? 'Slug already exists'
      : 'Failed to create category';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
