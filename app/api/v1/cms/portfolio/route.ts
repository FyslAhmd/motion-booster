import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { defaultPortfolio } from '@/lib/admin/store';
import { isRecoverableDbError } from '@/lib/server/db-error';

export async function GET() {
  try {
    const items = await prisma.portfolioItem.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(items);
  } catch (error) {
    console.error('GET /api/v1/cms/portfolio error:', error);

    if (isRecoverableDbError(error)) {
      return NextResponse.json(defaultPortfolio);
    }

    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await prisma.portfolioItem.count();
    const item = await prisma.portfolioItem.create({
      data: {
        title: body.title,
        category: body.category,
        description: body.description ?? '',
        client: body.client ?? '',
        result: body.result ?? '',
        tags: body.tags ?? [],
        coverColor: body.coverColor,
        coverImage: body.coverImage ?? null,
        featured: body.featured ?? false,
        order: count,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/cms/portfolio error:', error);
    return NextResponse.json({ error: 'Failed to create portfolio item' }, { status: 500 });
  }
}
