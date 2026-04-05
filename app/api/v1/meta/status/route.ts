import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { metaFetch, metaPost } from '@/lib/meta/client';
import { invalidateCache } from '@/lib/meta/cache';
import { validateRequest } from '@/lib/auth/validate-request';
import { getClientIp, logActivity } from '@/lib/server/activity-history';
import {
  buildMetaStatusRequestNotificationCopy,
  formatMetaObjectFallbackName,
  type NotificationMetaObjectType,
  type NotificationNextStatus,
} from '@/lib/server/notification-templates';
import { createNotification } from '@/lib/server/notifications';

type MetaObjectType = NotificationMetaObjectType;

const STATUS_VALUES: readonly NotificationNextStatus[] = ['ACTIVE', 'PAUSED'] as const;
type NextStatus = (typeof STATUS_VALUES)[number];

function normalizeObjectType(value?: string): MetaObjectType {
  const normalized = value?.trim().toUpperCase();
  if (normalized === 'ADSET' || normalized === 'AD') return normalized;
  return 'CAMPAIGN';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && typeof error.message === 'string') {
    return error.message;
  }
  return 'Unknown error';
}

async function resolveMetaObjectName(input: {
  objectId: string;
  objectType: MetaObjectType;
  providedName?: string;
}): Promise<string> {
  const providedName = input.providedName?.trim();
  if (providedName) return providedName;

  try {
    const response = await metaFetch<{ name?: string }>(`/${input.objectId}`, {
      fields: 'name',
    });
    const name = response?.name?.trim();
    if (name) return name;
  } catch {
    // Fallback to object id if name lookup fails.
  }

  return formatMetaObjectFallbackName(input.objectType, input.objectId);
}

async function createStatusRequestNotifications(input: {
  req: NextRequest;
  requester: {
    id: string;
    username: string;
    email: string;
    fullName: string;
  };
  objectId: string;
  objectType: MetaObjectType;
  objectName: string;
  nextStatus: NextStatus;
}): Promise<{ requestedToggle: 'ON' | 'OFF'; successMessage: string }> {
  const admins = await prisma.user.findMany({
    where: {
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    select: {
      id: true,
    },
  });

  if (admins.length === 0) {
    throw new Error('No active admin found to review status request');
  }

  const notificationCopy = buildMetaStatusRequestNotificationCopy({
    objectType: input.objectType,
    objectName: input.objectName,
    requesterFullName: input.requester.fullName,
    nextStatus: input.nextStatus,
  });

  const href = `/dashboard/user-campaigns/${input.requester.id}`;

  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: notificationCopy.type,
        title: notificationCopy.title,
        text: notificationCopy.text,
        href,
        logPath: href,
        logMethod: 'SYSTEM',
        logIpAddress: getClientIp(input.req),
        logUserAgent: input.req.headers.get('user-agent'),
        metadata: {
          requesterUserId: input.requester.id,
          requesterUsername: input.requester.username,
          requesterEmail: input.requester.email,
          requesterFullName: input.requester.fullName,
          requestedObjectId: input.objectId,
          requestedObjectType: input.objectType,
          requestedObjectName: input.objectName,
        },
      }),
    ),
  );

  return {
    requestedToggle: notificationCopy.requestedToggle,
    successMessage: notificationCopy.successMessage,
  };
}

/**
 * PATCH /api/v1/meta/status
 * Update the status of a campaign, ad set, or ad.
 *
 * Body JSON:
 *   { id: string, status: 'ACTIVE' | 'PAUSED' }
 *
 * The Meta access token is injected server-side — never exposed to the client.
 */
export async function PATCH(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, objectType, objectName } = body as {
      id?: string;
      status?: string;
      objectType?: string;
      objectName?: string;
    };

    const normalizedObjectType = normalizeObjectType(objectType);

    // ── Validate ──
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid "id"' },
        { status: 400 },
      );
    }

    if (!status || !STATUS_VALUES.includes(status as (typeof STATUS_VALUES)[number])) {
      return NextResponse.json(
        { success: false, error: `"status" must be one of: ${STATUS_VALUES.join(', ')}` },
        { status: 400 },
      );
    }

    const nextStatus = status as NextStatus;

    const submitUserStatusRequest = async (requestStatus: NextStatus): Promise<NextResponse> => {
      const resolvedObjectName = await resolveMetaObjectName({
        objectId: id,
        objectType: normalizedObjectType,
        providedName: objectName,
      });

      const notificationCopy = await createStatusRequestNotifications({
        req,
        requester: {
          id: auth.id,
          username: auth.username,
          email: auth.email,
          fullName: auth.fullName,
        },
        objectId: id,
        objectType: normalizedObjectType,
        objectName: resolvedObjectName,
        nextStatus: requestStatus,
      });

      try {
        await logActivity({
          userId: auth.id,
          eventType: 'CUSTOM_ACTION',
          action: `${normalizedObjectType} ${notificationCopy.requestedToggle} REQUESTED`,
          path: req.nextUrl.pathname,
          method: req.method,
          ipAddress: getClientIp(req),
          userAgent: req.headers.get('user-agent'),
          metadata: {
            module: 'meta-status',
            actorUserId: auth.id,
            actorUsername: auth.username,
            actorFullName: auth.fullName,
            targetObjectType: normalizedObjectType,
            targetObjectId: id,
            targetObjectName: resolvedObjectName,
            nextStatus: requestStatus,
            reviewStatus: 'PENDING_ADMIN_APPROVAL',
          },
        });
      } catch (logErr) {
        console.error('[meta/status request history]', logErr);
      }

      return NextResponse.json({
        success: true,
        requested: true,
        id,
        status: requestStatus,
        objectType: normalizedObjectType,
        message: notificationCopy.successMessage,
      });
    };

    if (auth.role === 'USER' && nextStatus === 'ACTIVE') {
      return submitUserStatusRequest('ACTIVE');
    }

    // ── POST to Meta Graph API ──
    let result: { success?: boolean } = {};
    try {
      result = await metaPost<{ success?: boolean }>(`/${id}`, { status: nextStatus });
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      const isPermissionError = /Meta API\s*200/i.test(errorMessage) || /permission/i.test(errorMessage);

      if (auth.role === 'USER' && nextStatus === 'PAUSED' && isPermissionError) {
        try {
          await logActivity({
            userId: auth.id,
            eventType: 'CUSTOM_ACTION',
            action: `${normalizedObjectType} OFF SOFT_PAUSED`,
            path: req.nextUrl.pathname,
            method: req.method,
            ipAddress: getClientIp(req),
            userAgent: req.headers.get('user-agent'),
            metadata: {
              module: 'meta-status',
              actorUserId: auth.id,
              actorUsername: auth.username,
              actorFullName: auth.fullName,
              targetObjectType: normalizedObjectType,
              targetObjectId: id,
              nextStatus,
              softPaused: true,
              metaError: errorMessage,
            },
          });
        } catch (logErr) {
          console.error('[meta/status soft-pause history]', logErr);
        }

        return NextResponse.json({
          success: true,
          id,
          status: nextStatus,
          objectType: normalizedObjectType,
          softPaused: true,
          message: 'Paused successfully.',
        });
      }

      throw err;
    }

    try {
      await logActivity({
        userId: auth.id,
        eventType: 'CUSTOM_ACTION',
        action: `${normalizedObjectType} ${nextStatus === 'ACTIVE' ? 'ON' : 'OFF'}`,
        path: req.nextUrl.pathname,
        method: req.method,
        ipAddress: getClientIp(req),
        userAgent: req.headers.get('user-agent'),
        metadata: {
          module: 'meta-status',
          actorUserId: auth.id,
          actorUsername: auth.username,
          actorFullName: auth.fullName,
          targetObjectType: normalizedObjectType,
          targetObjectId: id,
          nextStatus,
        },
      });
    } catch (logErr) {
      console.error('[meta/status history]', logErr);
    }

    // Invalidate cached data so next fetch reflects the change
    invalidateCache('meta:page:');
    invalidateCache('meta:campaign-names:');

    return NextResponse.json({
      success: result?.success !== false,
      id,
      status: nextStatus,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: getErrorMessage(err) },
      { status: 500 },
    );
  }
}
