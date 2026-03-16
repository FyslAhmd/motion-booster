import { Prisma } from '@/lib/generated/prisma';

const KNOWN_RECOVERABLE_CODES = new Set(['P1001', 'P1002', 'P2021', 'P2022']);

export function isRecoverableDbError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return KNOWN_RECOVERABLE_CODES.has(error.code);
  }

  const message = error instanceof Error ? error.message : '';
  return (
    message.includes("Can't reach database server") ||
    message.includes('Database schema is out of date') ||
    message.includes('does not exist')
  );
}
