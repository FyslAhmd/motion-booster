import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

// POST /api/v1/admin/user-budgets/deposits
// Body: { userId: string, amount: number, note?: string }
export async function POST(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const userId = String(body.userId || '').trim();
    const amount = Number(body.amount);
    const note = typeof body.note === 'string' ? body.note.trim() : undefined;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Amount must be a positive number' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!targetUser || targetUser.role !== 'USER') {
      return NextResponse.json({ success: false, error: 'Target user not found' }, { status: 404 });
    }

    const budgetDelegate = (prisma as any).userBudgetDeposit;

    if (budgetDelegate) {
      const entry = await budgetDelegate.create({
        data: {
          userId,
          amount,
          note: note || null,
          createdById: auth.id,
        },
        select: {
          id: true,
          userId: true,
          amount: true,
          note: true,
          createdAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...entry,
          amount: Number(entry.amount),
        },
      });
    }

    const id = randomUUID();
    const createdAt = new Date();
    await prisma.$executeRaw`
      INSERT INTO user_budget_deposits (id, user_id, amount, note, created_by_id, created_at)
      VALUES (${id}, ${userId}, ${amount}, ${note || null}, ${auth.id}, ${createdAt})
    `;

    return NextResponse.json({
      success: true,
      data: {
        id,
        userId,
        amount,
        note: note || null,
        createdAt,
      },
    });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return NextResponse.json(
        {
          success: false,
          error: 'Budget table is not migrated yet. Run: npx prisma migrate dev',
        },
        { status: 503 },
      );
    }
    console.error('[admin user-budgets/deposits POST]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to add deposit' },
      { status: 500 },
    );
  }
}
