export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const post = await prisma.blogPost.findFirst({ 
      where: { 
        slug,
        status: 'PUBLISHED'
      }
    });
    if (!post) return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    console.error('GET /api/v1/blog/[slug] error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}
