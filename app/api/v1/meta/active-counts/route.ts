import { NextResponse } from 'next/server';
import {
  fetchAdAccounts,
  fetchCampaignsPage,
  fetchAdSetsPage,
  fetchAdsPage,
} from '@/lib/meta/client';
import {
  deriveDeliveryStatus,
  deriveAdSetStatus,
  deriveAdStatus,
} from '@/lib/meta/derive-status';

interface CampaignRow {
  id?: string;
  effective_status: string;
  status: string;
  configured_status?: string;
  stop_time?: string;
  start_time?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  spend_cap?: string;
}

interface AdSetRow {
  id?: string;
  effective_status: string;
  status: string;
  campaign_id?: string;
}

interface AdRow {
  effective_status: string;
  status: string;
  campaign_id?: string;
  adset_id?: string;
}

interface ActiveCounts {
  campaigns: number;
  adSets: number;
  ads: number;
}

interface AdAccountRow {
  id?: string;
  account_status?: number;
}

async function getActiveCountsForAccount(accountId: string): Promise<ActiveCounts> {
  // Paginate through all effective_status=ACTIVE campaigns (100 per page)
  // and count only those that derive to truly ACTIVE status.
  let campaignActiveCount = 0;
  const activeCampaignIds = new Set<string>();
  let campaignAfter: string | undefined;

  for (let page = 0; page < 15; page++) { // max 1500 campaigns
    const batch = await fetchCampaignsPage({
      accountId,
      limit: 100,
      status: 'ACTIVE',
      after: campaignAfter,
    }).catch(() => null);

    if (!batch?.data?.length) break;

    for (const campaign of batch.data as CampaignRow[]) {
      const derived = deriveDeliveryStatus(campaign);
      if (derived.key !== 'ACTIVE') continue;
      campaignActiveCount += 1;
      if (campaign.id) activeCampaignIds.add(campaign.id);
    }

    // No more pages
    if (!batch.paging?.next) break;
    campaignAfter = batch.paging?.cursors?.after;
    if (!campaignAfter) break;
  }

  // Paginate ad sets and ads to avoid inflated summary.total_count values.
  let adSetActiveCount = 0;
  const activeAdSetIds = new Set<string>();
  let adSetsAfter: string | undefined;
  for (let page = 0; page < 30; page++) { // max 3000 ad sets
    const batch = await fetchAdSetsPage({
      accountId,
      limit: 100,
      status: 'ACTIVE',
      after: adSetsAfter,
    }).catch(() => null);

    if (!batch?.data?.length) break;

    for (const adSet of batch.data as AdSetRow[]) {
      const derived = deriveAdSetStatus(adSet);
      if (derived.key !== 'ACTIVE') continue;
      // Strict: count only when parent campaign is truly ACTIVE.
      if (!adSet.campaign_id || !activeCampaignIds.has(adSet.campaign_id)) {
        continue;
      }
      adSetActiveCount += 1;
      if (adSet.id) activeAdSetIds.add(adSet.id);
    }

    if (!batch.paging?.next) break;
    adSetsAfter = batch.paging?.cursors?.after;
    if (!adSetsAfter) break;
  }

  let adsActiveCount = 0;
  let adsAfter: string | undefined;
  for (let page = 0; page < 60; page++) { // max 6000 ads
    const batch = await fetchAdsPage({
      accountId,
      limit: 100,
      status: 'ACTIVE',
      after: adsAfter,
    }).catch(() => null);

    if (!batch?.data?.length) break;

    for (const ad of batch.data as AdRow[]) {
      const derived = deriveAdStatus(ad);
      if (derived.key !== 'ACTIVE') continue;
      // Strict: count only when parent campaign + ad set are truly ACTIVE.
      if (!ad.campaign_id || !activeCampaignIds.has(ad.campaign_id)) {
        continue;
      }
      if (!ad.adset_id || !activeAdSetIds.has(ad.adset_id)) {
        continue;
      }
      adsActiveCount += 1;
    }

    if (!batch.paging?.next) break;
    adsAfter = batch.paging?.cursors?.after;
    if (!adsAfter) break;
  }

  return {
    campaigns: campaignActiveCount,
    adSets: adSetActiveCount,
    ads: adsActiveCount,
  };
}

/**
 * GET /api/v1/meta/active-counts?account_id=act_xxx
 * Returns truly-active counts for campaigns, ad sets, and ads.
 *
 * Campaign count: paginates through all effective_status=ACTIVE campaigns
 * in batches of 100, applies deriveDeliveryStatus to each, counts truly-ACTIVE.
 * Ad set / ad counts: paginates effective_status=ACTIVE rows and applies derived
 * status checks, while also requiring parent campaign to be truly ACTIVE when
 * campaign_id is available. This avoids inflated counts vs Ads Manager.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('account_id');
    const debug = searchParams.get('debug') === '1';

    // Single-account mode
    if (accountId) {
      const counts = await getActiveCountsForAccount(accountId);
      return NextResponse.json({
        success: true,
        data: counts,
      });
    }

    // Multi-account aggregation mode (sum of all discovered accounts)
    const accounts = await fetchAdAccounts().catch(() => [] as AdAccountRow[]);
    const accountIds = Array.from(
      new Set(
        accounts
          .map((a) => a?.id)
          .filter((id): id is string => typeof id === 'string' && id.trim().length > 0),
      ),
    );

    if (accountIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { campaigns: 0, adSets: 0, ads: 0 },
      });
    }

    const perAccount = await Promise.allSettled(
      accountIds.map(async (id) => ({
        accountId: id,
        counts: await getActiveCountsForAccount(id),
      })),
    );

    const totals: ActiveCounts = { campaigns: 0, adSets: 0, ads: 0 };
    const perAccountBreakdown: Array<{ accountId: string; counts: ActiveCounts }> = [];
    for (const item of perAccount) {
      if (item.status !== 'fulfilled') continue;
      totals.campaigns += item.value.counts.campaigns;
      totals.adSets += item.value.counts.adSets;
      totals.ads += item.value.counts.ads;
      perAccountBreakdown.push(item.value);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...totals,
        ...(debug
          ? {
              accountsScanned: accountIds.length,
              perAccount: perAccountBreakdown,
            }
          : {}),
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
