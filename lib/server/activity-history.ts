import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@/lib/generated/prisma';

export type ActivityEventType = 'PAGE_VISIT' | 'API_REQUEST' | 'CUSTOM_ACTION';

export interface LogActivityInput {
  userId?: string | null;
  eventType: ActivityEventType;
  action: string;
  path?: string | null;
  method?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: unknown;
}

export function getClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip') || null;
}

export async function logActivity(input: LogActivityInput): Promise<void> {
  await prisma.activityHistory.create({
    data: {
      userId: input.userId ?? null,
      eventType: input.eventType,
      action: input.action,
      path: input.path ?? null,
      method: input.method ?? null,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
      metadata:
        input.metadata == null
          ? undefined
          : (input.metadata as Prisma.InputJsonValue),
    },
  });
}
