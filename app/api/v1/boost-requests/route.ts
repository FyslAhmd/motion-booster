import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';
import { requireAdmin } from '@/lib/auth/require-admin';

// ─── POST: User submits a boost request ──────────────
export async function POST(req: NextRequest) {
  const user = await validateRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { language, postLink, totalBudget, dailyBudget, targetAudience } = body;

  if (!postLink?.trim() || !totalBudget?.trim() || !dailyBudget?.trim() || !targetAudience?.trim()) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const record = await prisma.boostRequest.create({
    data: {
      userId: user.id,
      language: language === 'bn' ? 'bn' : 'en',
      postLink: postLink.trim(),
      totalBudget: totalBudget.trim(),
      dailyBudget: dailyBudget.trim(),
      targetAudience: targetAudience.trim(),
    },
    include: { user: { select: { id: true, fullName: true, email: true, phone: true, username: true } } },
  });

  return NextResponse.json(record, { status: 201 });
}

// ─── GET: Admin lists all boost requests (paginated + searchable) ──
export async function GET(req: NextRequest) {
  const result = await requireAdmin(req);
  if (result instanceof NextResponse) return result;

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
  const search = (searchParams.get('search') || '').trim();

  const where = search
    ? {
        OR: [
          { postLink: { contains: search, mode: 'insensitive' as const } },
          { targetAudience: { contains: search, mode: 'insensitive' as const } },
          { user: { fullName: { contains: search, mode: 'insensitive' as const } } },
          { user: { email: { contains: search, mode: 'insensitive' as const } } },
          { user: { phone: { contains: search, mode: 'insensitive' as const } } },
        ],
      }
    : {};

  const [total, items] = await Promise.all([
    prisma.boostRequest.count({ where }),
    prisma.boostRequest.findMany({
      where,
      include: { user: { select: { id: true, fullName: true, email: true, phone: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
