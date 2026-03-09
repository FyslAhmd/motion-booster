import { NextResponse } from 'next/server';
import {
  fetchCampaignsPage,
  fetchAdSetsPage,
  fetchAdsPage,
} from '@/lib/meta/client';
import { deriveDeliveryStatus } from '@/lib/meta/derive-status';

/**
 * GET /api/v1/meta/active-counts?account_id=act_xxx
 * Returns truly-active campaign count (derived via deriveDeliveryStatus),
 * plus raw ACTIVE counts for ad sets and ads.
 *
 * Campaign count: paginates through all effective_status=ACTIVE campaigns
 * in batches of 100, applies deriveDeliveryStatus to each, counts truly-ACTIVE.
 * Ad set / ad counts: use raw Meta summary.total_count (effective_status=ACTIVE).
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('account_id') || 'act_586481100654531';

    // Fetch ad sets and ads in parallel (raw count is accurate for these)
    const [adSets, ads] = await Promise.all([
      fetchAdSetsPage({ accountId, limit: 1, status: 'ACTIVE' }).catch(() => null),
      fetchAdsPage({ accountId, limit: 1, status: 'ACTIVE' }).catch(() => null),
    ]);

    // Paginate through all effective_status=ACTIVE campaigns (100 per page)
    // and count only those that derive to truly ACTIVE status.
    let campaignActiveCount = 0;
    let after: string | undefined;

    for (let page = 0; page < 15; page++) { // max 1500 campaigns
      const batch = await fetchCampaignsPage({
        accountId,
        limit: 100,
        status: 'ACTIVE',
        after,
      }).catch(() => null);

      if (!batch?.data?.length) break;

      campaignActiveCount += (batch.data as any[]).filter(
        (c) => deriveDeliveryStatus(c).key === 'ACTIVE',
      ).length;

      // No more pages
      if (!batch.paging?.next) break;
      after = batch.paging?.cursors?.after;
      if (!after) break;
    }

    return NextResponse.json({
      success: true,
      data: {
        campaigns: campaignActiveCount,
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
