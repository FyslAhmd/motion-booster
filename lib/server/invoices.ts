import { prisma } from '@/lib/db/prisma';

const GLOBAL_COUNTER_KEY = 'GLOBAL';

async function ensureInvoiceCounterTable() {
  // Keep invoice number generation resilient if a deployment missed migrations.
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "invoice_counters" (
      "counter_key" TEXT NOT NULL,
      "value" INTEGER NOT NULL DEFAULT 0,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "invoice_counters_pkey" PRIMARY KEY ("counter_key")
    )
  `);
}

export async function allocateNextInvoiceNumber() {
  await ensureInvoiceCounterTable();

  await prisma.$executeRaw`
    INSERT INTO invoice_counters (counter_key, value)
    VALUES (${GLOBAL_COUNTER_KEY}, 0)
    ON CONFLICT (counter_key) DO NOTHING
  `;

  const rows = await prisma.$queryRaw<Array<{ value: number }>>`
    UPDATE invoice_counters
    SET value = value + 1,
        updated_at = NOW()
    WHERE counter_key = ${GLOBAL_COUNTER_KEY}
    RETURNING value
  `;

  const nextValue = Number(rows[0]?.value || 0);
  return `MB-${String(nextValue).padStart(5, '0')}`;
}
