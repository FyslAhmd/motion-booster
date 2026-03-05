import { NextRequest, NextResponse } from 'next/server';
import { metaFetch } from '@/lib/meta/client';
import { validateRequest } from '@/lib/auth/validate-request';

const CAMPAIGN_FIELDS = [
  'id', 'name', 'objective', 'status', 'effective_status',
  'configured_status', 'daily_budget', 'lifetime_budget',
  'budget_remaining', 'spend_cap',
  'start_time', 'stop_time', 'created_time', 'updated_time',
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
    if (!auth || auth.role !== 'ADMIN') {
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

    const ids = idsParam.split(',').filter(Boolean);
    if (ids.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Limit to 50 per request to prevent abuse
    const limitedIds = ids.slice(0, 50);
    const fields = FIELDS_MAP[type];

    // Fetch all objects in parallel
    const results = await Promise.allSettled(
      limitedIds.map((id) =>
        metaFetch(`/${id}`, { fields }),
      ),
    );

    const data = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => r.value);

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('[meta/by-ids GET]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch objects' },
      { status: 500 },
    );
  }
}
