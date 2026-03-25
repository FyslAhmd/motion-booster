export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@/lib/generated/prisma';
import { defaultServiceCategories } from '@/lib/admin/store';
import { isRecoverableDbError } from '@/lib/server/db-error';

const DEFAULT_CATEGORIES = [
  { title: 'Digital Marketing', titleBn: 'ডিজিটাল মার্কেটিং',     slug: 'digital-marketing',     iconType: 'trending-up', iconColor: 'text-green-600',  iconBg: 'bg-green-50',  order: 0 },
  { title: 'Graphics Design', titleBn: 'গ্রাফিক্স ডিজাইন',       slug: 'graphics-design',       iconType: 'palette',     iconColor: 'text-purple-600', iconBg: 'bg-purple-50', order: 1 },
  { title: 'Software Development', titleBn: 'সফটওয়্যার ডেভেলপমেন্ট',  slug: 'software-development',  iconType: 'code',        iconColor: 'text-blue-600',   iconBg: 'bg-blue-50',   order: 2 },
  { title: 'Web Development', titleBn: 'ওয়েব ডেভেলপমেন্ট',       slug: 'web-development',       iconType: 'globe',       iconColor: 'text-cyan-600',   iconBg: 'bg-cyan-50',   order: 3 },
  { title: 'Mobile App Development', titleBn: 'মোবাইল অ্যাপ ডেভেলপমেন্ট',slug: 'mobile-app-development',iconType: 'smartphone',  iconColor: 'text-pink-600',   iconBg: 'bg-pink-50',   order: 4 },
  { title: 'UI/UX Design', titleBn: 'ইউআই/ইউএক্স ডিজাইন',          slug: 'ui-ux-design',          iconType: 'layers',      iconColor: 'text-orange-500', iconBg: 'bg-orange-50', order: 5 },
  { title: 'Branding & Creative', titleBn: 'ব্র্যান্ডিং ও ক্রিয়েটিভ',   slug: 'branding-creative',     iconType: 'sparkles',    iconColor: 'text-yellow-600', iconBg: 'bg-yellow-50', order: 6 },
  { title: 'Video & Animation', titleBn: 'ভিডিও ও অ্যানিমেশন',     slug: 'video-animation',       iconType: 'video',       iconColor: 'text-red-500',    iconBg: 'bg-red-50',    order: 7 },
  { title: 'Business Consulting', titleBn: 'বিজনেস কনসালটিং',   slug: 'business-consulting',   iconType: 'briefcase',   iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50', order: 8 },
  { title: 'Specialized Services', titleBn: 'স্পেশালাইজড সার্ভিসেস',  slug: 'specialized-services',  iconType: 'zap',         iconColor: 'text-teal-600',   iconBg: 'bg-teal-50',   order: 9 },
];

export async function GET() {
  try {
    let categories = await prisma.serviceCategory.findMany({ orderBy: { order: 'asc' } });

    if (categories.length === 0) {
      await prisma.serviceCategory.createMany({ data: DEFAULT_CATEGORIES, skipDuplicates: true });
      categories = await prisma.serviceCategory.findMany({ orderBy: { order: 'asc' } });
    }

    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error('[CMS service-categories GET]', error);

    if (isRecoverableDbError(error)) {
      return NextResponse.json(defaultServiceCategories);
    }

    return NextResponse.json({ error: 'Failed to load categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, titleBn, slug, iconType, iconColor, iconBg, logoImage } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const finalSlug = (slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();
    if (!finalSlug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const existing = await prisma.serviceCategory.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const count = await prisma.serviceCategory.count();

    const category = await prisma.serviceCategory.create({
      data: {
        title: title.trim(),
        titleBn: titleBn?.trim() || null,
        slug: finalSlug,
        iconType: iconType || 'layers',
        iconColor: iconColor || 'text-blue-600',
        iconBg: iconBg || 'bg-blue-50',
        logoImage: logoImage || null,
        order: count,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    console.error('[CMS service-categories POST]', error);

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

    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
