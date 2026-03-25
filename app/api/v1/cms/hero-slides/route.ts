export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { defaultHeroSlides } from '@/lib/admin/store';
import { isRecoverableDbError } from '@/lib/server/db-error';

const DEFAULT_SLIDES = [
  {
    image: '/header1.jpeg',
    title: 'Become an IT Pro & Rule the Digital World',
    titleBn: 'আইটি প্রফেশনাল হোন এবং ডিজিটাল দুনিয়ায় এগিয়ে যান',
    description: 'With a vision to turn manpower into assets, Motion Booster is ready to enhance your learning experience with skilled mentors and an updated curriculum. Pick your desired course from more than 45 trendy options.',
    descriptionBn: 'মানবসম্পদকে সম্পদে রূপান্তরের লক্ষ্য নিয়ে মোশন বুস্টার দক্ষ মেন্টর ও আপডেটেড কারিকুলামের মাধ্যমে আপনার শেখার অভিজ্ঞতা উন্নত করতে প্রস্তুত। ৪৫টির বেশি ট্রেন্ডি কোর্স থেকে আপনার পছন্দেরটি বেছে নিন।',
    badge: 'Unleash Your Potential',
    badgeBn: 'নিজের সম্ভাবনা উন্মোচন করুন',
    ctaText: 'Browse Course',
    ctaTextBn: 'কোর্স দেখুন',
    ctaLink: '/features',
    order: 0,
  },
  {
    image: '/header2.jpeg',
    title: 'Learn From Industry Experts',
    titleBn: 'ইন্ডাস্ট্রি এক্সপার্টদের কাছ থেকে শিখুন',
    description: "Get hands-on training from professionals with years of real-world experience. Master the skills that companies are looking for in today's competitive market.",
    descriptionBn: 'দীর্ঘ বাস্তব অভিজ্ঞতাসম্পন্ন প্রফেশনালদের কাছ থেকে হাতে-কলমে প্রশিক্ষণ নিন। আজকের প্রতিযোগিতামূলক বাজারে যেসব দক্ষতা কোম্পানিগুলো চায় সেগুলো আয়ত্ত করুন।',
    badge: 'Expert Training',
    badgeBn: 'বিশেষজ্ঞ প্রশিক্ষণ',
    ctaText: 'Join Free Seminar',
    ctaTextBn: 'ফ্রি সেমিনারে যোগ দিন',
    ctaLink: '/contact',
    order: 1,
  },
  {
    image: '/header3.jpeg',
    title: 'Perfect Training for Perfect IT Preparation',
    titleBn: 'সেরা আইটি প্রস্তুতির জন্য সেরা প্রশিক্ষণ',
    description: 'Comprehensive courses designed to prepare you for a successful career in IT. From beginner to advanced, we have programs tailored for every skill level.',
    descriptionBn: 'আইটিতে সফল ক্যারিয়ারের জন্য প্রস্তুত করতে তৈরি করা হয়েছে আমাদের বিস্তৃত কোর্সসমূহ। বিগিনার থেকে অ্যাডভান্সড, প্রতিটি স্কিল লেভেলের জন্য রয়েছে উপযোগী প্রোগ্রাম।',
    badge: "South Asia's Best IT Institute",
    badgeBn: 'দক্ষিণ এশিয়ার সেরা আইটি ইনস্টিটিউট',
    ctaText: 'Explore Programs',
    ctaTextBn: 'প্রোগ্রাম দেখুন',
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

    if (isRecoverableDbError(error)) {
      const fallback = defaultHeroSlides.map((slide, index) => ({
        ...slide,
        customImage: null,
        order: index,
      }));
      return NextResponse.json(fallback);
    }

    return NextResponse.json({ error: 'Failed to load slides' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, customImage, title, titleBn, description, descriptionBn, badge, badgeBn, ctaText, ctaTextBn, ctaLink } = body;

    const count = await prisma.heroSlide.count();
    const slide = await prisma.heroSlide.create({
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
        order: count,
      },
    });

    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error('[CMS hero-slides POST]', error);
    return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 });
  }
}
