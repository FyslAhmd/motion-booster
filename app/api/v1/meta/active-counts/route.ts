import { NextResponse } from 'next/server';
import {
  fetchCampaignsPage,
  fetchAdSetsPage,
  fetchAdsPage,
} from '@/lib/meta/client';

/**
 * GET /api/v1/meta/active-counts?account_id=act_xxx
 * Returns total active campaigns, ad sets, and ads for the given account.
 * Reuses existing fetchers (limit=1, status=ACTIVE) with summary.total_count.
 * Cached server-side via the underlying fetchers (2 min TTL).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('account_id') || 'act_586481100654531';

    const opts = { accountId, limit: 1, status: 'ACTIVE' } as const;

    const [campaigns, adSets, ads] = await Promise.all([
      fetchCampaignsPage(opts).catch(() => null),
      fetchAdSetsPage(opts).catch(() => null),
      fetchAdsPage(opts).catch(() => null),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        campaigns: campaigns?.summary?.total_count ?? 0,
        adSets: adSets?.summary?.total_count ?? 0,
        ads: ads?.summary?.total_count ?? 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
