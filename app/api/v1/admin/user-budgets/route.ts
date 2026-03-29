import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';
import { metaFetchAll } from '@/lib/meta/client';

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

  // Keep filtering payload size safe for Meta API
  const idChunks = chunk(Array.from(new Set(ids)), 50);

  for (const idChunk of idChunks) {
    const rows = await metaFetchAll<Record<string, string>>(`/${accountId}/insights`, {
      fields: `${config.responseId},spend`,
      level: config.level,
      date_preset: 'maximum',
      filtering: JSON.stringify([
        { field: config.filterField, operator: 'IN', value: idChunk },
      ]),
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

// GET /api/v1/admin/user-budgets
// Returns non-admin users with total deposited budget, assigned spend, and current balance.
export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = auth.role === 'ADMIN';

    const budgetDelegate = (prisma as any).userBudgetDeposit;

    const [users, assignments] = await Promise.all([
      prisma.user.findMany({
        where: isAdmin ? { role: 'USER' } : { id: auth.id },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          status: true,
          createdAt: true,
          avatarUrl: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.metaAdAssignment.findMany({
        select: {
          userId: true,
          metaObjectId: true,
          metaObjectType: true,
          metaAccountId: true,
        },
      }),
    ]);

    let depositsByUserId = new Map<string, { totalBudget: number; depositsCount: number }>();
    let latestDepositByUserId = new Map<string, Date | null>();

    try {
      if (budgetDelegate) {
        const [depositsAgg, latestDepositAgg] = await Promise.all([
          budgetDelegate.groupBy({
            by: ['userId'],
            _sum: { amount: true },
            _count: { _all: true },
          }),
          budgetDelegate.groupBy({
            by: ['userId'],
            _max: { createdAt: true },
          }),
        ]);

        depositsByUserId = new Map(
          depositsAgg.map((d: any) => [
            d.userId,
            {
              totalBudget: Number(d._sum.amount || 0),
              depositsCount: d._count._all,
            },
          ]),
        );

        latestDepositByUserId = new Map(
          latestDepositAgg.map((d: any) => [d.userId, d._max.createdAt]),
        );
      } else {
        const rows = await prisma.$queryRaw<Array<{
          userId: string;
          totalBudget: unknown;
          depositsCount: bigint | number;
          lastDepositAt: Date | null;
        }>>`
          SELECT
            user_id AS "userId",
            COALESCE(SUM(amount), 0) AS "totalBudget",
            COUNT(*) AS "depositsCount",
            MAX(created_at) AS "lastDepositAt"
          FROM user_budget_deposits
          GROUP BY user_id
        `;

        depositsByUserId = new Map(
          rows.map((r) => [
            r.userId,
            {
              totalBudget: Number(r.totalBudget || 0),
              depositsCount: Number(r.depositsCount || 0),
            },
          ]),
        );

        latestDepositByUserId = new Map(
          rows.map((r) => [r.userId, r.lastDepositAt]),
        );
      }
    } catch (depositErr: any) {
      // If migration isn't applied yet, return users with zero budget values.
      if (depositErr?.code !== 'P2021') throw depositErr;
      depositsByUserId = new Map();
      latestDepositByUserId = new Map();
    }

    // Group IDs by account+type for batched Meta insights fetches
    const idsByAccountAndType = new Map<string, Set<string>>();
    for (const a of assignments) {
      const key = `${a.metaAccountId}::${a.metaObjectType}`;
      if (!idsByAccountAndType.has(key)) idsByAccountAndType.set(key, new Set());
      idsByAccountAndType.get(key)!.add(a.metaObjectId);
    }

    // Resolve spend for every assigned object ID
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

    // Aggregate assigned spend per user
    const spentByUserId = new Map<string, number>();
    for (const a of assignments) {
      const spend = spendByObjectId.get(a.metaObjectId) || 0;
      spentByUserId.set(a.userId, (spentByUserId.get(a.userId) || 0) + spend);
    }

    const data = users.map((u) => {
      const deposit = depositsByUserId.get(u.id);
      const totalBudget = deposit?.totalBudget || 0;
      const totalSpent = spentByUserId.get(u.id) || 0;
      const balance = totalBudget - totalSpent;

      const userAssignments = assignments.filter((a) => a.userId === u.id);
      const assignedCounts = {
        campaigns: userAssignments.filter((a) => a.metaObjectType === 'CAMPAIGN').length,
        adSets: userAssignments.filter((a) => a.metaObjectType === 'ADSET').length,
        ads: userAssignments.filter((a) => a.metaObjectType === 'AD').length,
      };

      return {
        ...u,
        totalBudget,
        totalSpent,
        balance,
        depositsCount: deposit?.depositsCount || 0,
        lastDepositAt: latestDepositByUserId.get(u.id) || null,
        assignedCounts,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[admin user-budgets GET]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch user budgets' },
      { status: 500 },
    );
  }
}
