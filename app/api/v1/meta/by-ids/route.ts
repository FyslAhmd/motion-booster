import { NextRequest, NextResponse } from 'next/server';
import { metaFetch } from '@/lib/meta/client';
import { validateRequest } from '@/lib/auth/validate-request';
import { prisma } from '@/lib/db/prisma';
import { deriveDeliveryStatus } from '@/lib/meta/derive-status';

const CAMPAIGN_FIELDS = [
  'id', 'name', 'objective', 'status', 'effective_status',
  'configured_status', 'daily_budget', 'lifetime_budget',
  'budget_remaining', 'spend_cap',
  'start_time', 'stop_time', 'created_time', 'updated_time',
  'promoted_object',
  'ads.limit(1){creative{thumbnail_url}}',
].join(',');

const ADSET_FIELDS = [
  'id', 'name', 'status', 'effective_status', 'campaign_id',
  'daily_budget', 'lifetime_budget', 'budget_remaining',
  'optimization_goal', 'start_time', 'end_time', 'created_time',
  'targeting',
].join(',');

const AD_FIELDS = [
  'id', 'name', 'status', 'effective_status',
  'adset_id', 'campaign_id', 'created_time',
  'creative{id,name,thumbnail_url,body,title}',
].join(',');

const FIELDS_MAP: Record<string, string> = {
  CAMPAIGN: CAMPAIGN_FIELDS,
  ADSET: ADSET_FIELDS,
  AD: AD_FIELDS,
};

/**
 * GET /api/v1/meta/by-ids?type=CAMPAIGN&ids=id1,id2,id3
 * Fetches individual Meta objects by their IDs.
 * Used by the User Campaign detail page.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'CAMPAIGN' | 'ADSET' | 'AD' | null;
    const idsParam = searchParams.get('ids');

    if (!type || !FIELDS_MAP[type]) {
      return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
    }
    if (!idsParam) {
      return NextResponse.json({ success: true, data: [] });
    }

    let ids = idsParam.split(',').filter(Boolean);
    if (ids.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Keep requested order, but avoid duplicate fetches
    ids = Array.from(new Set(ids));

    // Non-admin users: only allow IDs that are assigned to them
    if (auth.role !== 'ADMIN') {
      const assigned = await prisma.metaAdAssignment.findMany({
        where: { userId: auth.id, metaObjectId: { in: ids }, metaObjectType: type },
        select: { metaObjectId: true },
      });
      const allowedIds = new Set(assigned.map((a) => a.metaObjectId));
      ids = ids.filter((id) => allowedIds.has(id));
      if (ids.length === 0) {
        return NextResponse.json({ success: true, data: [] });
      }
    }

    const fields = FIELDS_MAP[type];
    const chunkSize = 50;
    const data: unknown[] = [];

    // Fetch all objects chunk-by-chunk so large assignment sets are fully returned
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const results = await Promise.allSettled(
        chunk.map((id) =>
          metaFetch(`/${id}`, { fields }),
        ),
      );

      const chunkData = results
        .filter((r): r is PromiseFulfilledResult<unknown> => r.status === 'fulfilled')
        .map((r) => ({
          ...(r.value as Record<string, unknown>),
          derived_status: deriveDeliveryStatus(r.value as any),
        }));

      data.push(...chunkData);
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error('[meta/by-ids GET]', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch objects';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
