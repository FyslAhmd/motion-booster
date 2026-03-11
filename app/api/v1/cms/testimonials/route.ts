import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('GET /api/v1/cms/testimonials error:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await prisma.testimonial.count();
    const testimonial = await prisma.testimonial.create({
      data: {
        name: body.name,
        role: body.role,
        avatar: body.avatar,
        avatarBg: body.avatarBg,
        avatarImage: body.avatarImage ?? null,
        rating: body.rating ?? 5,
        review: body.review,
        service: body.service,
        order: count,
      },
    });
    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/cms/testimonials error:', error);
    return NextResponse.json({ error: 'Failed to create testimonial' }, { status: 500 });
  }
}
