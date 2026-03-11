import { PrismaClient } from '@/lib/generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Append pgbouncer + connection_limit params so Prisma works correctly with
// Neon's PgBouncer connection pooler and doesn't exhaust the connection limit.
function buildDatasourceUrl() {
  const base = process.env.DATABASE_URL ?? '';
  if (!base) return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}pgbouncer=true&connection_limit=1`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasourceUrl: buildDatasourceUrl(),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
