import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('GET /api/v1/cms/blog error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await prisma.blogPost.count();

    // Generate unique slug from title
    const baseSlug = slugify(body.title || 'untitled');
    let slug = baseSlug;
    let attempt = 1;
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${attempt++}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug: body.slug?.trim() || slug,
        excerpt: body.excerpt,
        content: body.content,
        coverImage: body.coverImage ?? null,
        category: body.category,
        tags: Array.isArray(body.tags) ? body.tags : [],
        author: body.author || 'Motion Booster',
        status: body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        order: count,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/cms/blog error:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
