import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';
import { metaFetchAll } from '@/lib/meta/client';
import { createNotification } from '@/lib/server/notifications';
import { getClientIp } from '@/lib/server/activity-history';

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

type MetaType = 'CAMPAIGN' | 'ADSET' | 'AD';

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function fetchSpendMapForType(accountId: string, type: MetaType, ids: string[]) {
  const out = new Map<string, number>();
  if (ids.length === 0) return out;

  const config =
    type === 'CAMPAIGN'
      ? { level: 'campaign', responseId: 'campaign_id', filterField: 'campaign.id' }
      : type === 'ADSET'
        ? { level: 'adset', responseId: 'adset_id', filterField: 'adset.id' }
        : { level: 'ad', responseId: 'ad_id', filterField: 'ad.id' };

  const idChunks = chunk(Array.from(new Set(ids)), 50);

  for (const idChunk of idChunks) {
    const rows = await metaFetchAll<Record<string, string>>(`/${accountId}/insights`, {
      fields: `${config.responseId},spend`,
      level: config.level,
      date_preset: 'maximum',
      filtering: JSON.stringify([{ field: config.filterField, operator: 'IN', value: idChunk }]),
    });

    for (const row of rows) {
      const objectId = row[config.responseId];
      const spendRaw = row.spend;
      if (!objectId) continue;
      const spend = Number.parseFloat(spendRaw || '0');
      if (Number.isNaN(spend)) continue;
      out.set(objectId, (out.get(objectId) || 0) + spend);
    }
  }

  return out;
}

async function getUserCurrentBalance(userId: string): Promise<number> {
  const [depositsAgg, assignments] = await Promise.all([
    prisma.userBudgetDeposit.aggregate({
      where: { userId },
      _sum: { amount: true },
    }),
    prisma.metaAdAssignment.findMany({
      where: { userId },
      select: {
        metaObjectId: true,
        metaObjectType: true,
        metaAccountId: true,
      },
    }),
  ]);

  const totalBudget = Number(depositsAgg._sum.amount || 0);

  const idsByAccountAndType = new Map<string, Set<string>>();
  for (const assignment of assignments) {
    const key = `${assignment.metaAccountId}::${assignment.metaObjectType}`;
    if (!idsByAccountAndType.has(key)) idsByAccountAndType.set(key, new Set());
    idsByAccountAndType.get(key)!.add(assignment.metaObjectId);
  }

  const spendByObjectId = new Map<string, number>();
  await Promise.all(
    Array.from(idsByAccountAndType.entries()).map(async ([key, idSet]) => {
      const [accountId, type] = key.split('::') as [string, MetaType];
      const typeSpendMap = await fetchSpendMapForType(accountId, type, Array.from(idSet));
      for (const [id, spend] of typeSpendMap.entries()) {
        spendByObjectId.set(id, spend);
      }
    }),
  );

  const totalSpent = assignments.reduce((sum, assignment) => {
    return sum + (spendByObjectId.get(assignment.metaObjectId) || 0);
  }, 0);

  return totalBudget - totalSpent;
}

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
      select: { id: true, role: true, fullName: true, username: true },
    });

    if (!targetUser || targetUser.role !== 'USER') {
      return NextResponse.json({ success: false, error: 'Target user not found' }, { status: 404 });
    }

    const previousBalance = await getUserCurrentBalance(userId);
    const nextBalance = Number((previousBalance + signedAmount).toFixed(6));

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

      await createNotification({
        userId,
        type: 'GENERAL',
        title: direction === 'ADD' ? 'Budget added to your account' : 'Budget deducted from your account',
        text:
          direction === 'ADD'
            ? `Admin added $${amount.toFixed(2)} to your balance. Current balance: $${nextBalance.toFixed(2)}.`
            : `Admin deducted $${amount.toFixed(2)} from your balance. Current balance: $${nextBalance.toFixed(2)}.`,
        href: '/dashboard/user-budget',
        logPath: req.nextUrl.pathname,
        logMethod: req.method,
        logIpAddress: getClientIp(req),
        logUserAgent: req.headers.get('user-agent'),
        metadata: {
          direction,
          method: resolvedMethod,
          amount,
          previousBalance,
          nextBalance,
          adjustedByAdminId: auth.id,
          adjustedByAdminUsername: auth.username,
          targetUserId: targetUser.id,
          targetUserName: targetUser.fullName || targetUser.username,
        },
      });

      if (nextBalance < 1 && previousBalance >= 1) {
        await createNotification({
          userId,
          type: 'GENERAL',
          title: 'Low balance alert',
          text: `Your account balance is below $1. Current balance: $${nextBalance.toFixed(2)}.`,
          href: '/dashboard/user-budget',
          logPath: req.nextUrl.pathname,
          logMethod: req.method,
          logIpAddress: getClientIp(req),
          logUserAgent: req.headers.get('user-agent'),
          metadata: {
            alertType: 'LOW_BALANCE',
            threshold: 1,
            previousBalance,
            nextBalance,
          },
        });
      }

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

    await createNotification({
      userId,
      type: 'GENERAL',
      title: direction === 'ADD' ? 'Budget added to your account' : 'Budget deducted from your account',
      text:
        direction === 'ADD'
          ? `Admin added $${amount.toFixed(2)} to your balance. Current balance: $${nextBalance.toFixed(2)}.`
          : `Admin deducted $${amount.toFixed(2)} from your balance. Current balance: $${nextBalance.toFixed(2)}.`,
      href: '/dashboard/user-budget',
      logPath: req.nextUrl.pathname,
      logMethod: req.method,
      logIpAddress: getClientIp(req),
      logUserAgent: req.headers.get('user-agent'),
      metadata: {
        direction,
        method: resolvedMethod,
        amount,
        previousBalance,
        nextBalance,
        adjustedByAdminId: auth.id,
        adjustedByAdminUsername: auth.username,
        targetUserId: targetUser.id,
        targetUserName: targetUser.fullName || targetUser.username,
      },
    });

    if (nextBalance < 1 && previousBalance >= 1) {
      await createNotification({
        userId,
        type: 'GENERAL',
        title: 'Low balance alert',
        text: `Your account balance is below $1. Current balance: $${nextBalance.toFixed(2)}.`,
        href: '/dashboard/user-budget',
        logPath: req.nextUrl.pathname,
        logMethod: req.method,
        logIpAddress: getClientIp(req),
        logUserAgent: req.headers.get('user-agent'),
        metadata: {
          alertType: 'LOW_BALANCE',
          threshold: 1,
          previousBalance,
          nextBalance,
        },
      });
    }

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
