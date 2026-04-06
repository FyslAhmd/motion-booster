import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const metaStatusRequestDelegate = (prisma as unknown as {
      metaStatusRequest?: { count: (args: { where: { state: 'PENDING'; requestedStatus: 'ACTIVE' } }) => Promise<number> };
    }).metaStatusRequest;

    const userBudgetDepositDelegate = (prisma as unknown as {
      userBudgetDeposit?: {
        count: () => Promise<number>;
        aggregate: (args: { _sum: { amount: true } }) => Promise<{ _sum: { amount: unknown } }>;
      };
    }).userBudgetDeposit;

    const contactMessageDelegate = (prisma as unknown as {
      contactMessage?: { count: (args: { where: { isRead: false } }) => Promise<number> };
    }).contactMessage;

    const [
      totalClients,
      unseenMessages,
      pendingBoostRequests,
      reactivationRequests,
      budgetIncreaseCount,
      mediaMessageCount,
      totalBudgetDeposits,
      activeAds,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }).catch(() => 0),
      // Count unread client messages for this admin's conversations only.
      prisma.message.count({
        where: {
          status: { not: 'READ' },
          sender: { role: 'USER' },
          conversation: {
            participants: {
              some: { id: auth.id },
            },
          },
        },
      }).catch(() => 0),
      prisma.boostRequest.count({
        where: {
          completed: false,
          AND: [
            {
              NOT: {
                targetAudience: {
                  contains: 'status: completed',
                  mode: 'insensitive',
                },
              },
            },
            {
              NOT: {
                targetAudience: {
                  contains: 'status: cancelled',
                  mode: 'insensitive',
                },
              },
            },
            {
              NOT: {
                targetAudience: {
                  contains: 'status: canceled',
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
      }).catch(() => 0),
      metaStatusRequestDelegate
        ? metaStatusRequestDelegate
            .count({ where: { state: 'PENDING', requestedStatus: 'ACTIVE' } })
            .catch(() => 0)
        : Promise.resolve(0),
      userBudgetDepositDelegate
        ? userBudgetDepositDelegate.count().catch(() => 0)
        : Promise.resolve(0),
      contactMessageDelegate
        ? contactMessageDelegate.count({ where: { isRead: false } }).catch(() => 0)
        : Promise.resolve(0),
      userBudgetDepositDelegate
        ? userBudgetDepositDelegate
            .aggregate({ _sum: { amount: true } })
            .then((res) => Number(res?._sum?.amount || 0))
            .catch(() => 0)
        : prisma
            .$queryRaw<Array<{ total: unknown }>>`
              SELECT COALESCE(SUM(amount), 0) AS total
              FROM user_budget_deposits
            `
            .then((rows) => Number(rows?.[0]?.total || 0))
            .catch(() => 0),
      prisma
        .$queryRaw<Array<{ total: unknown }>>`
          SELECT COUNT(DISTINCT meta_object_id) AS total
          FROM meta_ad_assignments
          WHERE meta_object_type = 'CAMPAIGN'
        `
        .then((rows) => Number(rows?.[0]?.total || 0))
        .catch(() => 0),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalClients,
        unseenMessages,
        pendingBoostRequests,
        reactivationRequests,
        budgetIncreaseCount,
        mediaMessageCount,
        totalBudgetDeposits,
        activeAds,
      },
    });
  } catch (error) {
    console.error('[admin stats]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
