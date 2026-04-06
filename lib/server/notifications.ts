import { prisma } from '@/lib/db/prisma';
import { logActivity } from '@/lib/server/activity-history';
import { notificationBus, type LiveNotificationPayload } from '@/lib/server/notification-bus';
import type { NotificationType, Prisma } from '@/lib/generated/prisma';

export interface CreateNotificationInput {
  userId: string;
  type?: NotificationType;
  title: string;
  text: string;
  href?: string;
  metadata?: Prisma.InputJsonValue;
  logPath?: string;
  logMethod?: string;
  logIpAddress?: string | null;
  logUserAgent?: string | null;
}

export async function createNotification(input: CreateNotificationInput) {
  const fallbackPayload: LiveNotificationPayload = {
    id: crypto.randomUUID(),
    type: input.type ?? 'GENERAL',
    title: input.title,
    text: input.text,
    href: input.href ?? '/dashboard',
    createdAt: new Date().toISOString(),
  };

  let payload = fallbackPayload;

  try {
    const notificationDelegate = (prisma as unknown as {
      notification?: {
        create?: (args: {
          data: {
            userId: string;
            type: NotificationType;
            title: string;
            text: string;
            href: string;
            metadata?: Prisma.InputJsonValue;
          };
        }) => Promise<{
          id: string;
          type: NotificationType;
          title: string;
          text: string;
          href: string | null;
          createdAt: Date;
        }>;
      };
    }).notification;

    if (typeof notificationDelegate?.create !== 'function') {
      throw new Error('Prisma notification delegate is unavailable');
    }

    const row = await notificationDelegate.create({
      data: {
        userId: input.userId,
        type: input.type ?? 'GENERAL',
        title: input.title,
        text: input.text,
        href: input.href ?? '/dashboard',
        metadata: input.metadata,
      },
    });

    payload = {
      id: row.id,
      type: row.type,
      title: row.title,
      text: row.text,
      href: row.href || '/dashboard',
      createdAt: row.createdAt.toISOString(),
    };
  } catch (error) {
    console.error('[notifications create]', error);
  }

  notificationBus.emit('notification:new', {
    userId: input.userId,
    notification: payload,
  });

  void logActivity({
    userId: input.userId,
    eventType: 'CUSTOM_ACTION',
    action: `Notification: ${input.title}`,
    path: input.logPath ?? input.href ?? '/dashboard',
    method: input.logMethod ?? 'SYSTEM',
    ipAddress: input.logIpAddress ?? null,
    userAgent: input.logUserAgent ?? null,
    metadata: {
      module: 'notifications',
      type: input.type ?? 'GENERAL',
      title: input.title,
      text: input.text,
      href: input.href ?? '/dashboard',
      source: 'notification-service',
      ...(input.metadata && typeof input.metadata === 'object' ? input.metadata as Record<string, unknown> : {}),
    },
  }).catch(() => {
    // Notification should still succeed if history logging fails.
  });

  return payload;
}
