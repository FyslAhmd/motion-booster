import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await requireAdmin(req);
  if (result instanceof NextResponse) return result;

  const { id } = await params;

  let body: { completed?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (typeof body.completed !== 'boolean') {
    return NextResponse.json({ error: '"completed" must be a boolean' }, { status: 400 });
  }

  try {
    const updated = await prisma.boostRequest.update({
      where: { id },
      data: {
        completed: body.completed,
        completedAt: body.completed ? new Date() : null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update boost request' }, { status: 500 });
  }
}

