import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

const DEFAULT_SLIDES = [
  {
    image: '/header1.jpeg',
    title: 'Become an IT Pro & Rule the Digital World',
    description: 'With a vision to turn manpower into assets, Motion Booster is ready to enhance your learning experience with skilled mentors and an updated curriculum. Pick your desired course from more than 45 trendy options.',
    badge: 'Unleash Your Potential',
    ctaText: 'Browse Course',
    ctaLink: '/features',
    order: 0,
  },
  {
    image: '/header2.jpeg',
    title: 'Learn From Industry Experts',
    description: "Get hands-on training from professionals with years of real-world experience. Master the skills that companies are looking for in today's competitive market.",
    badge: 'Expert Training',
    ctaText: 'Join Free Seminar',
    ctaLink: '/contact',
    order: 1,
  },
  {
    image: '/header3.jpeg',
    title: 'Perfect Training for Perfect IT Preparation',
    description: 'Comprehensive courses designed to prepare you for a successful career in IT. From beginner to advanced, we have programs tailored for every skill level.',
    badge: "South Asia's Best IT Institute",
    ctaText: 'Explore Programs',
    ctaLink: '/service',
    order: 2,
  },
];

export async function GET() {
  try {
    let slides = await prisma.heroSlide.findMany({ orderBy: { order: 'asc' } });

    if (slides.length === 0) {
      await prisma.heroSlide.createMany({ data: DEFAULT_SLIDES });
      slides = await prisma.heroSlide.findMany({ orderBy: { order: 'asc' } });
    }

    return NextResponse.json(slides);
  } catch (error) {
    console.error('[CMS hero-slides GET]', error);
    return NextResponse.json({ error: 'Failed to load slides' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, customImage, title, description, badge, ctaText, ctaLink } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const count = await prisma.heroSlide.count();
    const slide = await prisma.heroSlide.create({
      data: {
        image: image || '/header1.jpeg',
        customImage: customImage || null,
        title: title.trim(),
        description: description || '',
        badge: badge || null,
        ctaText: ctaText || null,
        ctaLink: ctaLink || null,
        order: count,
      },
    });

    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error('[CMS hero-slides POST]', error);
    return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 });
  }
}
