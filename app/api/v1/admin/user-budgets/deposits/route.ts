import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

type Direction = 'ADD' | 'DECREASE';
type PaymentMethod =
  | 'MASTER_CARD'
  | 'VISA_CARD'
  | 'BANK_ACCOUNT'
  | 'BKASH'
  | 'NAGAD'
  | 'ROCKET'
  | 'OTHERS';

const ALLOWED_METHODS: PaymentMethod[] = [
  'MASTER_CARD',
  'VISA_CARD',
  'BANK_ACCOUNT',
  'BKASH',
  'NAGAD',
  'ROCKET',
  'OTHERS',
];

// POST /api/v1/admin/user-budgets/deposits
// Body: { userId: string, amount: number, direction?: 'ADD' | 'DECREASE', method?: PaymentMethod, methodOther?: string, note?: string }
export async function POST(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const userId = String(body.userId || '').trim();
    const amount = Number(body.amount);
    const note = typeof body.note === 'string' ? body.note.trim() : '';
    const directionRaw = String(body.direction || 'ADD').toUpperCase();
    const direction: Direction = directionRaw === 'DECREASE' ? 'DECREASE' : 'ADD';
    const methodRaw = String(body.method || '').toUpperCase();
    const method = ALLOWED_METHODS.includes(methodRaw as PaymentMethod)
      ? (methodRaw as PaymentMethod)
      : null;
    const methodOther = typeof body.methodOther === 'string' ? body.methodOther.trim() : '';

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Amount must be a positive number' }, { status: 400 });
    }

    if (!method) {
      return NextResponse.json({ success: false, error: 'Please select a valid payment method' }, { status: 400 });
    }

    if (method === 'OTHERS' && !methodOther) {
      return NextResponse.json({ success: false, error: 'Please provide the custom payment method' }, { status: 400 });
    }

    const resolvedMethod = method === 'OTHERS' ? methodOther : method;
    const signedAmount = direction === 'DECREASE' ? -amount : amount;
    const metadataNote = `[${direction}] method=${resolvedMethod}${note ? ` | note=${note}` : ''}`;

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
          amount: signedAmount,
          note: metadataNote,
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
          direction,
          method: resolvedMethod,
        },
      });
    }

    const id = randomUUID();
    const createdAt = new Date();
    await prisma.$executeRaw`
      INSERT INTO user_budget_deposits (id, user_id, amount, note, created_by_id, created_at)
      VALUES (${id}, ${userId}, ${signedAmount}, ${metadataNote}, ${auth.id}, ${createdAt})
    `;

    return NextResponse.json({
      success: true,
      data: {
        id,
        userId,
        amount: signedAmount,
        note: metadataNote,
        createdAt,
        direction,
        method: resolvedMethod,
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
