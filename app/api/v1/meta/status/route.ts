import { NextResponse } from 'next/server';
import { metaPost } from '@/lib/meta/client';
import { invalidateCache } from '@/lib/meta/cache';

/**
 * PATCH /api/v1/meta/status
 * Update the status of a campaign, ad set, or ad.
 *
 * Body JSON:
 *   { id: string, status: 'ACTIVE' | 'PAUSED' }
 *
 * The Meta access token is injected server-side — never exposed to the client.
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body as { id?: string; status?: string };

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
