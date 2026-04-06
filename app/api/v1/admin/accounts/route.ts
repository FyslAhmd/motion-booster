import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

type AccountEntryType = 'OTHER' | 'TOTAL_ADJUSTMENT';

type AccountEntryDelegate = {
  findMany: (args: {
    select: {
      id: true;
      userId: true;
      type: true;
      title: true;
      amount: true;
      createdAt: true;
      createdBy: {
        select: {
          id: true;
          fullName: true;
          username: true;
        };
      };
    };
    orderBy: { createdAt: 'desc' };
  }) => Promise<Array<{
    id: string;
    userId: string;
    type: AccountEntryType;
    title: string;
    amount: unknown;
    createdAt: Date;
    createdBy: {
      id: string;
      fullName: string;
      username: string;
    } | null;
  }>>;
  create: (args: {
    data: {
      userId: string;
      type: AccountEntryType;
      title: string;
      amount: number;
      createdById: string;
    };
    select: {
      id: true;
      userId: true;
      type: true;
      title: true;
      amount: true;
      createdAt: true;
    };
  }) => Promise<{
    id: string;
    userId: string;
    type: AccountEntryType;
    title: string;
    amount: unknown;
    createdAt: Date;
  }>;
};

type RawAccountEntryRow = {
  id: string;
  userId: string;
  type: AccountEntryType;
  title: string;
  amount: unknown;
  createdAt: Date;
  createdById?: string | null;
  createdByFullName?: string | null;
  createdByUsername?: string | null;
};

let ensureStoragePromise: Promise<void> | null = null;

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

function parsePositiveAmount(raw: unknown): number | null {
  const amount = typeof raw === 'string' ? Number.parseFloat(raw) : Number(raw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }
  return Number(amount.toFixed(2));
}

function getDbErrorCode(err: unknown): string | null {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code?: unknown }).code;
    return typeof code === 'string' ? code : null;
  }

  return null;
}

function isMissingAccountsStorageError(err: unknown): boolean {
  const code = getDbErrorCode(err);
  return code === 'P2021' || code === '42P01' || code === '42704';
}

async function ensureAccountEntriesStorage(): Promise<void> {
  if (ensureStoragePromise) {
    await ensureStoragePromise;
    return;
  }

  ensureStoragePromise = (async () => {
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        CREATE TYPE "AccountEntryType" AS ENUM ('OTHER', 'TOTAL_ADJUSTMENT');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END
      $$;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "user_account_entries" (
        "id" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "type" "AccountEntryType" NOT NULL DEFAULT 'OTHER',
        "title" TEXT NOT NULL,
        "amount" DECIMAL(14,2) NOT NULL,
        "created_by_id" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "user_account_entries_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'user_account_entries_user_id_fkey'
        ) THEN
          ALTER TABLE "user_account_entries"
            ADD CONSTRAINT "user_account_entries_user_id_fkey"
            FOREIGN KEY ("user_id") REFERENCES "users"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END
      $$;
    `);

    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'user_account_entries_created_by_id_fkey'
        ) THEN
          ALTER TABLE "user_account_entries"
            ADD CONSTRAINT "user_account_entries_created_by_id_fkey"
            FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END
      $$;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "user_account_entries_user_id_idx"
        ON "user_account_entries"("user_id");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "user_account_entries_type_idx"
        ON "user_account_entries"("type");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "user_account_entries_created_by_id_idx"
        ON "user_account_entries"("created_by_id");
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "user_account_entries_created_at_idx"
        ON "user_account_entries"("created_at");
    `);
  })();

  try {
    await ensureStoragePromise;
  } catch (err) {
    ensureStoragePromise = null;
    throw err;
  }
}

async function readEntriesViaRawQuery(): Promise<RawAccountEntryRow[]> {
  await ensureAccountEntriesStorage();

  return prisma.$queryRaw<RawAccountEntryRow[]>`
    SELECT
      e.id,
      e.user_id AS "userId",
      e.type::text AS "type",
      e.title,
      e.amount,
      e.created_at AS "createdAt",
      u.id AS "createdById",
      u.full_name AS "createdByFullName",
      u.username AS "createdByUsername"
    FROM user_account_entries e
    LEFT JOIN users u ON u.id = e.created_by_id
    ORDER BY e.created_at DESC
  `;
}

async function createEntryViaRawQuery(input: {
  userId: string;
  type: AccountEntryType;
  title: string;
  amount: number;
  createdById: string;
}): Promise<RawAccountEntryRow | null> {
  await ensureAccountEntriesStorage();

  const rows = await prisma.$queryRaw<RawAccountEntryRow[]>`
    INSERT INTO user_account_entries (
      id,
      user_id,
      type,
      title,
      amount,
      created_by_id,
      updated_at
    )
    VALUES (
      ${buildEntryId()},
      ${input.userId},
      ${input.type}::"AccountEntryType",
      ${input.title},
      ${input.amount},
      ${input.createdById},
      NOW()
    )
    RETURNING
      id,
      user_id AS "userId",
      type::text AS "type",
      title,
      amount,
      created_at AS "createdAt"
  `;

  return rows[0] || null;
}

function buildEntryId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `uae_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function isSupportedType(value: string): value is AccountEntryType {
  return value === 'OTHER' || value === 'TOTAL_ADJUSTMENT';
}

// GET /api/v1/admin/accounts
// Returns every user with account entries for "Others" and "Total Adjustment".
export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const accountEntryDelegate = (
      prisma as unknown as { userAccountEntry?: Pick<AccountEntryDelegate, 'findMany'> }
    ).userAccountEntry;

    const [users, entries] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'USER' },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          phone: true,
          avatarUrl: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      (async () => {
        if (!accountEntryDelegate) {
          return readEntriesViaRawQuery();
        }

        try {
          return await accountEntryDelegate.findMany({
            select: {
              id: true,
              userId: true,
              type: true,
              title: true,
              amount: true,
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
          });
        } catch (err) {
          if (!isMissingAccountsStorageError(err)) {
            throw err;
          }

          return readEntriesViaRawQuery();
        }
      })(),
    ]);

    const bucket = new Map<string, {
      otherEntries: Array<{
        id: string;
        title: string;
        amount: number;
        createdAt: Date;
        createdBy: { id: string; fullName: string; username: string } | null;
      }>;
      totalAdjustmentEntries: Array<{
        id: string;
        title: string;
        amount: number;
        createdAt: Date;
        createdBy: { id: string; fullName: string; username: string } | null;
      }>;
      othersTotal: number;
      totalAdjustmentTotal: number;
    }>();

    for (const user of users) {
      bucket.set(user.id, {
        otherEntries: [],
        totalAdjustmentEntries: [],
        othersTotal: 0,
        totalAdjustmentTotal: 0,
      });
    }

    for (const entry of entries) {
      const target = bucket.get(entry.userId);
      if (!target) continue;

      const createdBy = 'createdBy' in entry
        ? entry.createdBy
        : (entry.createdById
            ? {
                id: entry.createdById,
                fullName: entry.createdByFullName || '',
                username: entry.createdByUsername || '',
              }
            : null);

      const mapped = {
        id: entry.id,
        title: entry.title,
        amount: Number(entry.amount),
        createdAt: entry.createdAt,
        createdBy,
      };

      if (entry.type === 'OTHER') {
        target.otherEntries.push(mapped);
        target.othersTotal += mapped.amount;
      } else {
        target.totalAdjustmentEntries.push(mapped);
        target.totalAdjustmentTotal += mapped.amount;
      }
    }

    const data = users.map((user) => {
      const entryData = bucket.get(user.id) || {
        otherEntries: [],
        totalAdjustmentEntries: [],
        othersTotal: 0,
        totalAdjustmentTotal: 0,
      };

      return {
        ...user,
        othersTotal: Number(entryData.othersTotal.toFixed(2)),
        totalAdjustmentTotal: Number(entryData.totalAdjustmentTotal.toFixed(2)),
        otherEntries: entryData.otherEntries,
        totalAdjustmentEntries: entryData.totalAdjustmentEntries,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    if (isMissingAccountsStorageError(err)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accounts storage is not ready yet. Please run database migration and try again.',
        },
        { status: 503 },
      );
    }

    console.error('[admin accounts GET]', err);
    return NextResponse.json(
      { success: false, error: getErrorMessage(err, 'Failed to fetch account data') },
      { status: 500 },
    );
  }
}

// POST /api/v1/admin/accounts
// Creates one entry under "Others" or "Total Adjustment" for a user.
export async function POST(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const userId = String(body?.userId || '').trim();
    const typeRaw = String(body?.type || '').toUpperCase();
    const titleRaw = String(body?.title || '').trim();
    const amount = parsePositiveAmount(body?.amount);

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
    }

    if (!isSupportedType(typeRaw)) {
      return NextResponse.json({ success: false, error: 'Invalid entry type' }, { status: 400 });
    }

    if (amount == null) {
      return NextResponse.json({ success: false, error: 'Amount must be a positive number' }, { status: 400 });
    }

    if (typeRaw === 'OTHER' && !titleRaw) {
      return NextResponse.json({ success: false, error: 'Title is required for Others' }, { status: 400 });
    }

    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        role: 'USER',
      },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const accountEntryDelegate = (
      prisma as unknown as { userAccountEntry?: Pick<AccountEntryDelegate, 'create'> }
    ).userAccountEntry;

    let created: {
      id: string;
      userId: string;
      type: AccountEntryType;
      title: string;
      amount: unknown;
      createdAt: Date;
    } | null = null;

    const payload = {
      userId,
      type: typeRaw,
      title: titleRaw || 'Total Adjustment',
      amount,
      createdById: auth.id,
    } as const;

    if (accountEntryDelegate) {
      try {
        created = await accountEntryDelegate.create({
          data: payload,
          select: {
            id: true,
            userId: true,
            type: true,
            title: true,
            amount: true,
            createdAt: true,
          },
        });
      } catch (err) {
        if (!isMissingAccountsStorageError(err)) {
          throw err;
        }

        created = await createEntryViaRawQuery(payload);
      }
    } else {
      created = await createEntryViaRawQuery(payload);
    }

    if (!created) {
      throw new Error('Failed to create account entry');
    }

    return NextResponse.json({
      success: true,
      data: {
        ...created,
        amount: Number(created.amount),
      },
    });
  } catch (err: unknown) {
    if (isMissingAccountsStorageError(err)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accounts storage is not ready yet. Please run database migration and try again.',
        },
        { status: 503 },
      );
    }

    console.error('[admin accounts POST]', err);
    return NextResponse.json(
      { success: false, error: getErrorMessage(err, 'Failed to create account entry') },
      { status: 500 },
    );
  }
}
