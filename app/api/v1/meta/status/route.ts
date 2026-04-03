import { NextRequest, NextResponse } from 'next/server';
import { metaPost } from '@/lib/meta/client';
import { invalidateCache } from '@/lib/meta/cache';
import { validateRequest } from '@/lib/auth/validate-request';
import { getClientIp, logActivity } from '@/lib/server/activity-history';

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
    const { id, status, objectType } = body as { id?: string; status?: string; objectType?: string };

    // ── Validate ──
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid "id"' },
        { status: 400 },
      );
    }

    const allowed = ['ACTIVE', 'PAUSED'];
    if (!status || !allowed.includes(status)) {
      return NextResponse.json(
        { success: false, error: `"status" must be one of: ${allowed.join(', ')}` },
        { status: 400 },
      );
    }

    // ── POST to Meta Graph API ──
    const result = await metaPost(`/${id}`, { status });

    try {
      const normalizedObjectType = typeof objectType === 'string' && objectType.trim()
        ? objectType.trim().toUpperCase()
        : 'CAMPAIGN';

      await logActivity({
        userId: auth.id,
        eventType: 'CUSTOM_ACTION',
        action: `${normalizedObjectType} ${status === 'ACTIVE' ? 'ON' : 'OFF'}`,
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
          nextStatus: status,
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
      status,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
