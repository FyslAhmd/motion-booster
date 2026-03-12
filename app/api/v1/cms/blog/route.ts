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
    
    // Validation
    if (!body.title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!body.excerpt?.trim()) {
      return NextResponse.json({ error: 'Excerpt is required' }, { status: 400 });
    }
    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    
    const count = await prisma.blogPost.count();

    // Generate unique slug from title
    const baseSlug = slugify(body.title.trim());
    let slug = body.slug?.trim() || baseSlug;
    
    // Ensure slug uniqueness
    let attempt = 1;
    const originalSlug = slug;
    while (await prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${originalSlug}-${attempt++}`;
    }

    const post = await prisma.blogPost.create({
      data: {
        title: body.title.trim(),
        slug,
        excerpt: body.excerpt.trim(),
        content: body.content.trim(),
        coverImage: body.coverImage ?? null,
        category: body.category?.trim() || '',
        tags: Array.isArray(body.tags) ? body.tags.filter(Boolean) : [],
        author: body.author?.trim() || 'Motion Booster',
        status: body.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        order: count,
      },
    });
    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/v1/cms/blog error:', error);
    
    // Check for unique constraint violations
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
