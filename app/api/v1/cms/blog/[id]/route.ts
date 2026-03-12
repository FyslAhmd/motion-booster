import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    console.error('GET /api/v1/cms/blog/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
    
    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({ where: { id } });
    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    // Generate slug if needed
    let slug = body.slug?.trim();
    if (!slug) {
      slug = slugify(body.title.trim());
    }
    
    // Ensure slug uniqueness (excluding current post)
    const existingSlugPost = await prisma.blogPost.findFirst({
      where: {
        slug,
        id: { not: id }
      }
    });
    
    if (existingSlugPost) {
      let attempt = 1;
      const originalSlug = slug;
      do {
        slug = `${originalSlug}-${attempt++}`;
      } while (await prisma.blogPost.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      }));
    }
    
    const post = await prisma.blogPost.update({
      where: { id },
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
        order: body.order,
      },
    });
    return NextResponse.json(post);
  } catch (error: any) {
    console.error('PUT /api/v1/cms/blog/[id] error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return NextResponse.json({ error: 'A post with this slug already exists' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({ where: { id } });
    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/v1/cms/blog/[id] error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}
