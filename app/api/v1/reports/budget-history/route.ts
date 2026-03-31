import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

type HistoryRow = {
  id: string;
  amount: number;
  note: string | null;
  createdAt: Date;
  createdBy: {
    id: string;
    fullName: string;
    username: string;
  } | null;
};

// GET /api/v1/reports/budget-history?page=1&limit=10
// Returns logged-in user's budget transaction history, newest first.
export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const pageRaw = Number.parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
    const limitRaw = Number.parseInt(req.nextUrl.searchParams.get('limit') || '10', 10);

    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limit = Number.isFinite(limitRaw) ? Math.min(50, Math.max(1, limitRaw)) : 10;
    const skip = (page - 1) * limit;

    const search = (req.nextUrl.searchParams.get('q') || '').trim();
    const type = (req.nextUrl.searchParams.get('type') || 'ALL').toUpperCase();
    const from = (req.nextUrl.searchParams.get('from') || '').trim();
    const to = (req.nextUrl.searchParams.get('to') || '').trim();

    const fromDate = from ? new Date(`${from}T00:00:00.000Z`) : null;
    const toDate = to ? new Date(`${to}T23:59:59.999Z`) : null;
    const hasFromDate = Boolean(fromDate && !Number.isNaN(fromDate.getTime()));
    const hasToDate = Boolean(toDate && !Number.isNaN(toDate.getTime()));

    const where: any = { userId: auth.id };

    if (type === 'ADD') {
      where.amount = { gt: 0 };
    } else if (type === 'DECREASE') {
      where.amount = { lt: 0 };
    }

    if (hasFromDate || hasToDate) {
      where.createdAt = {
        ...(hasFromDate ? { gte: fromDate } : {}),
        ...(hasToDate ? { lte: toDate } : {}),
      };
    }

    if (search) {
      where.note = { contains: search, mode: 'insensitive' };
    }

    const budgetDelegate = (prisma as any).userBudgetDeposit;

    if (budgetDelegate) {
      const [total, rows] = await Promise.all([
        budgetDelegate.count({ where }),
        budgetDelegate.findMany({
          where,
          select: {
            id: true,
            amount: true,
            note: true,
            createdAt: true,
            createdBy: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      const data: HistoryRow[] = rows.map((row: any) => ({
        id: row.id,
        amount: Number(row.amount),
        note: row.note || null,
        createdAt: row.createdAt,
        createdBy: row.createdBy
          ? {
              id: row.createdBy.id,
              fullName: row.createdBy.fullName,
              username: row.createdBy.username,
            }
          : null,
      }));

      return NextResponse.json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      });
    }

    const totalRows = await prisma.$queryRaw<Array<{ total: bigint | number }>>`
      SELECT COUNT(*) AS total
      FROM user_budget_deposits
      WHERE user_id = ${auth.id}
      AND (
        ${type} = 'ALL'
        OR (${type} = 'ADD' AND amount > 0)
        OR (${type} = 'DECREASE' AND amount < 0)
      )
      AND (${search} = '' OR COALESCE(note, '') ILIKE '%' || ${search} || '%')
      AND (${hasFromDate} = false OR created_at >= ${hasFromDate ? fromDate : null})
      AND (${hasToDate} = false OR created_at <= ${hasToDate ? toDate : null})
    `;

    const total = Number(totalRows?.[0]?.total || 0);

    const rows = await prisma.$queryRaw<Array<{
      id: string;
      amount: unknown;
      note: string | null;
      createdAt: Date;
      createdById: string | null;
      createdByFullName: string | null;
      createdByUsername: string | null;
    }>>`
      SELECT
        d.id,
        d.amount,
        d.note,
        d.created_at AS "createdAt",
        d.created_by_id AS "createdById",
        u.full_name AS "createdByFullName",
        u.username AS "createdByUsername"
      FROM user_budget_deposits d
      LEFT JOIN users u ON u.id = d.created_by_id
      WHERE d.user_id = ${auth.id}
      AND (
        ${type} = 'ALL'
        OR (${type} = 'ADD' AND d.amount > 0)
        OR (${type} = 'DECREASE' AND d.amount < 0)
      )
      AND (${search} = '' OR COALESCE(d.note, '') ILIKE '%' || ${search} || '%')
      AND (${hasFromDate} = false OR d.created_at >= ${hasFromDate ? fromDate : null})
      AND (${hasToDate} = false OR d.created_at <= ${hasToDate ? toDate : null})
      ORDER BY d.created_at DESC
      OFFSET ${skip}
      LIMIT ${limit}
    `;

    const data: HistoryRow[] = rows.map((row) => ({
      id: row.id,
      amount: Number(row.amount || 0),
      note: row.note || null,
      createdAt: row.createdAt,
      createdBy: row.createdById
        ? {
            id: row.createdById,
            fullName: row.createdByFullName || '',
            username: row.createdByUsername || '',
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
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

    console.error('[reports budget-history GET]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch budget history' },
      { status: 500 },
    );
  }
}
