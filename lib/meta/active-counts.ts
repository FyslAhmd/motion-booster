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

interface AdAccountRow {
  id?: string;
  account_status?: number;
}

export interface ActiveCounts {
  campaigns: number;
  adSets: number;
  ads: number;
}

export interface ActiveCountPerAccountDebug {
  accountId: string;
  campaignPagesFetched: number;
  campaignRowsScanned: number;
  adSetPagesFetched: number;
  adSetRowsScanned: number;
  adPagesFetched: number;
  adRowsScanned: number;
  counts: ActiveCounts;
  durationMs: number;
}

export interface ActiveCountsSummary {
  totals: ActiveCounts;
  accountIds: string[];
  discoveredAccounts: Array<{ id: string; accountStatus: number | null }>;
  perAccount: ActiveCountPerAccountDebug[];
  failures: Array<{ accountId: string; error: string }>;
  env: {
    defaultAccountId: string | null;
    tokenFingerprint: string;
  };
  durationMs: number;
}

export interface ActiveCountsOptions {
  source?: string;
  verbose?: boolean;
  scope?: 'full' | 'campaigns-only';
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function tokenFingerprint(): string {
  const token = process.env.META_ACCESS_TOKEN || '';
  if (!token) return 'missing';
  if (token.length <= 12) return `len:${token.length}`;
  return `${token.slice(0, 6)}...${token.slice(-4)} (len:${token.length})`;
}

function logMeta(source: string, message: string, payload?: unknown) {
  if (payload === undefined) {
    console.log(`[meta-active-counts][${source}] ${message}`);
    return;
  }
  console.log(`[meta-active-counts][${source}] ${message}`, payload);
}

export async function getActiveCountsForAccount(
  accountId: string,
  options: ActiveCountsOptions = {},
): Promise<ActiveCountPerAccountDebug> {
  const source = options.source || 'unknown';
  const verbose = Boolean(options.verbose || process.env.META_COUNTS_DEBUG === '1');
  const scope = options.scope || 'full';

  const startedAt = Date.now();

  let campaignActiveCount = 0;
  let adSetActiveCount = 0;
  let adsActiveCount = 0;

  let campaignPagesFetched = 0;
  let campaignRowsScanned = 0;
  let adSetPagesFetched = 0;
  let adSetRowsScanned = 0;
  let adPagesFetched = 0;
  let adRowsScanned = 0;

  const activeCampaignIds = new Set<string>();
  const activeAdSetIds = new Set<string>();

  let campaignAfter: string | undefined;

  for (let page = 0; page < 15; page++) {
    let batch;
    try {
      batch = await fetchCampaignsPage({
        accountId,
        limit: 100,
        status: 'ACTIVE',
        after: campaignAfter,
      });
    } catch (error) {
      logMeta(source, 'campaign page fetch failed', {
        accountId,
        page: page + 1,
        after: campaignAfter || null,
        error: toErrorMessage(error),
      });
      throw error;
    }

    campaignPagesFetched += 1;
    const rows = (batch?.data || []) as CampaignRow[];
    campaignRowsScanned += rows.length;

    if (verbose) {
      logMeta(source, 'campaign page scanned', {
        accountId,
        page: page + 1,
        rows: rows.length,
        after: campaignAfter || null,
        hasNext: Boolean(batch?.paging?.next),
      });
    }

    if (!rows.length) break;

    for (const campaign of rows) {
      const derived = deriveDeliveryStatus(campaign);
      if (derived.key !== 'ACTIVE') continue;
      campaignActiveCount += 1;
      if (campaign.id) activeCampaignIds.add(campaign.id);
    }

    if (!batch.paging?.next) break;
    campaignAfter = batch.paging?.cursors?.after;
    if (!campaignAfter) break;
  }

  if (scope === 'full') {
    let adSetsAfter: string | undefined;
    for (let page = 0; page < 30; page++) {
      let batch;
      try {
        batch = await fetchAdSetsPage({
          accountId,
          limit: 100,
          status: 'ACTIVE',
          after: adSetsAfter,
        });
      } catch (error) {
        logMeta(source, 'ad set page fetch failed', {
          accountId,
          page: page + 1,
          after: adSetsAfter || null,
          error: toErrorMessage(error),
        });
        throw error;
      }

      adSetPagesFetched += 1;
      const rows = (batch?.data || []) as AdSetRow[];
      adSetRowsScanned += rows.length;

      if (verbose) {
        logMeta(source, 'ad set page scanned', {
          accountId,
          page: page + 1,
          rows: rows.length,
          after: adSetsAfter || null,
          hasNext: Boolean(batch?.paging?.next),
        });
      }

      if (!rows.length) break;

      for (const adSet of rows) {
        const derived = deriveAdSetStatus(adSet);
        if (derived.key !== 'ACTIVE') continue;
        if (!adSet.campaign_id || !activeCampaignIds.has(adSet.campaign_id)) continue;
        adSetActiveCount += 1;
        if (adSet.id) activeAdSetIds.add(adSet.id);
      }

      if (!batch.paging?.next) break;
      adSetsAfter = batch.paging?.cursors?.after;
      if (!adSetsAfter) break;
    }

    let adsAfter: string | undefined;
    for (let page = 0; page < 60; page++) {
      let batch;
      try {
        batch = await fetchAdsPage({
          accountId,
          limit: 100,
          status: 'ACTIVE',
          after: adsAfter,
        });
      } catch (error) {
        logMeta(source, 'ads page fetch failed', {
          accountId,
          page: page + 1,
          after: adsAfter || null,
          error: toErrorMessage(error),
        });
        throw error;
      }

      adPagesFetched += 1;
      const rows = (batch?.data || []) as AdRow[];
      adRowsScanned += rows.length;

      if (verbose) {
        logMeta(source, 'ads page scanned', {
          accountId,
          page: page + 1,
          rows: rows.length,
          after: adsAfter || null,
          hasNext: Boolean(batch?.paging?.next),
        });
      }

      if (!rows.length) break;

      for (const ad of rows) {
        const derived = deriveAdStatus(ad);
        if (derived.key !== 'ACTIVE') continue;
        if (!ad.campaign_id || !activeCampaignIds.has(ad.campaign_id)) continue;
        if (!ad.adset_id || !activeAdSetIds.has(ad.adset_id)) continue;
        adsActiveCount += 1;
      }

      if (!batch.paging?.next) break;
      adsAfter = batch.paging?.cursors?.after;
      if (!adsAfter) break;
    }
  }

  const debugData: ActiveCountPerAccountDebug = {
    accountId,
    campaignPagesFetched,
    campaignRowsScanned,
    adSetPagesFetched,
    adSetRowsScanned,
    adPagesFetched,
    adRowsScanned,
    counts: {
      campaigns: campaignActiveCount,
      adSets: adSetActiveCount,
      ads: adsActiveCount,
    },
    durationMs: Date.now() - startedAt,
  };

  logMeta(source, 'account count summary', debugData);

  return debugData;
}

export async function getActiveCountsAcrossAccounts(
  options: ActiveCountsOptions = {},
): Promise<ActiveCountsSummary> {
  const source = options.source || 'unknown';
  const verbose = Boolean(options.verbose || process.env.META_COUNTS_DEBUG === '1');
  const scope = options.scope || 'full';

  const startedAt = Date.now();

  const discovered = await fetchAdAccounts().catch((error) => {
    logMeta(source, 'failed to discover ad accounts', { error: toErrorMessage(error) });
    return [] as AdAccountRow[];
  });

  const discoveredAccounts = discovered
    .map((account) => ({
      id: account?.id || '',
      accountStatus: typeof account?.account_status === 'number' ? account.account_status : null,
    }))
    .filter((account) => account.id.length > 0);

  const accountIds = Array.from(new Set(discoveredAccounts.map((account) => account.id)));

  logMeta(source, 'account discovery result', {
    accountIds,
    discoveredAccounts,
    env: {
      defaultAccountId: process.env.META_AD_ACCOUNT_ID || null,
      tokenFingerprint: tokenFingerprint(),
    },
  });

  const totals: ActiveCounts = { campaigns: 0, adSets: 0, ads: 0 };
  const perAccount: ActiveCountPerAccountDebug[] = [];
  const failures: Array<{ accountId: string; error: string }> = [];

  if (accountIds.length > 0) {
    const results = await Promise.allSettled(
      accountIds.map((accountId) =>
        getActiveCountsForAccount(accountId, {
          source,
          verbose,
          scope,
        }),
      ),
    );

    for (let i = 0; i < results.length; i++) {
      const accountId = accountIds[i];
      const result = results[i];

      if (result.status === 'fulfilled') {
        perAccount.push(result.value);
        totals.campaigns += result.value.counts.campaigns;
        totals.adSets += result.value.counts.adSets;
        totals.ads += result.value.counts.ads;
      } else {
        failures.push({ accountId, error: toErrorMessage(result.reason) });
      }
    }
  }

  const summary: ActiveCountsSummary = {
    totals,
    accountIds,
    discoveredAccounts,
    perAccount,
    failures,
    env: {
      defaultAccountId: process.env.META_AD_ACCOUNT_ID || null,
      tokenFingerprint: tokenFingerprint(),
    },
    durationMs: Date.now() - startedAt,
  };

  logMeta(source, 'aggregate count summary', summary);

  return summary;
}
