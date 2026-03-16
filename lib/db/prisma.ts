import { PrismaClient } from '@/lib/generated/prisma';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Append pgbouncer + connection_limit params so Prisma works correctly with
// Neon's PgBouncer connection pooler and doesn't exhaust the connection limit.
function buildDatasourceUrl() {
  const base = process.env.DATABASE_URL ?? '';
  if (!base) return base;

  // Defaults are safe for parallel page/API loads in development and production.
  const connectionLimit = process.env.PRISMA_CONNECTION_LIMIT ?? '10';
  const poolTimeout = process.env.PRISMA_POOL_TIMEOUT ?? '30';

  const url = new URL(base);
  url.searchParams.set('pgbouncer', 'true');
  url.searchParams.set('connection_limit', connectionLimit);
  url.searchParams.set('pool_timeout', poolTimeout);
  return url.toString();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasourceUrl: buildDatasourceUrl(),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
