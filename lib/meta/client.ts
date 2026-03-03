/**
 * Meta Marketing API client – server-side only.
 * All Graph API calls are funnelled through this module so the
 * access-token never leaks to the browser.
 *
 * v2 – Uses Meta's native pagination & filtering for speed.
 *       Supports multi-account via accountId parameter.
 */

import { cachedFetch } from './cache';

const GRAPH_BASE = 'https://graph.facebook.com/v25.0';
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

function getToken(): string {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error('META_ACCESS_TOKEN is not configured');
  return token;
}

function getDefaultAccountId(): string {
  const id = process.env.META_AD_ACCOUNT_ID;
  if (!id) throw new Error('META_AD_ACCOUNT_ID is not configured');
  return id;
}

// ───────────────────────────────────────────────
// Generic fetcher
// ───────────────────────────────────────────────

interface MetaError {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id?: string;
  };
}

export async function metaFetch<T = any>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${GRAPH_BASE}${path}`);
  url.searchParams.set('access_token', getToken());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString());
  const json = await res.json();

  if ((json as MetaError).error) {
    const e = (json as MetaError).error;
    throw new Error(`Meta API ${e.code}: ${e.message}`);
  }

  return json as T;
}

// ───────────────────────────────────────────────
// Paginated response types
// ───────────────────────────────────────────────

export interface MetaPaginatedResponse<T = any> {
  data: T[];
  paging?: {
    cursors?: { before?: string; after?: string };
    next?: string;
    previous?: string;
  };
  summary?: { total_count?: number };
}

// ───────────────────────────────────────────────
// Single-page fetch (native Meta pagination)
// ───────────────────────────────────────────────

/**
 * Fetch a single page from Meta API with native limit/after cursor.
 * Returns raw data + paging info — no multi-page crawling.
 * This is the KEY to fast page loads (<1s per request).
 */
export async function metaFetchPage<T = any>(
  path: string,
  params: Record<string, string> = {},
): Promise<MetaPaginatedResponse<T>> {
  return metaFetch<MetaPaginatedResponse<T>>(path, params);
}

// ───────────────────────────────────────────────
// Fetch-all helper (still used for small datasets like accounts)
// ───────────────────────────────────────────────

export async function metaFetchAll<T = any>(
  path: string,
  params: Record<string, string> = {},
  maxPages = 10,
): Promise<T[]> {
  const items: T[] = [];
  let after: string | undefined;
  let page = 0;

  while (page < maxPages) {
    const p: Record<string, string> = { ...params, limit: '100' };
    if (after) p.after = after;

    const res = await metaFetch<MetaPaginatedResponse<T>>(path, p);
    items.push(...(res.data ?? []));

    if (!res.paging?.cursors?.after || !res.paging?.next) break;
    after = res.paging.cursors.after;
    page++;
  }

  return items;
}

// ───────────────────────────────────────────────
// Domain-specific fetchers
// ───────────────────────────────────────────────

/** All ad accounts for this token (cached 5 min) */
export function fetchAdAccounts() {
  return cachedFetch('meta:all-accounts', () =>
    metaFetchAll('/me/adaccounts', {
      fields: 'id,name,account_status,currency,amount_spent,business_name',
    }),
    5 * 60 * 1000,
  );
}

/** Single ad account info (cached per account) */
export function fetchAdAccount(accountId?: string) {
  const id = accountId || getDefaultAccountId();
  return cachedFetch(`meta:account:${id}`, () =>
    metaFetch(`/${id}`, {
      fields: [
        'id', 'name', 'account_status', 'currency', 'amount_spent',
        'balance', 'spend_cap', 'business_name', 'timezone_name',
        'min_daily_budget', 'created_time',
      ].join(','),
    }),
    CACHE_TTL,
  );
}

// ───────────────────────────────────────────────
// Direct-pagination fetchers (1 request → 1 page of results)
// ───────────────────────────────────────────────

const CAMPAIGN_FIELDS = [
  'id', 'name', 'objective', 'status', 'effective_status',
  'daily_budget', 'lifetime_budget', 'budget_remaining',
  'start_time', 'stop_time', 'created_time', 'updated_time',
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

/**
 * Build Meta filtering JSON for name search.
 */
function buildFiltering(
  search?: string,
  extraFilters?: { field: string; operator: string; value: string }[],
): string | undefined {
  const filters: { field: string; operator: string; value: string }[] = [];
  if (search) {
    filters.push({ field: 'name', operator: 'CONTAIN', value: search });
  }
  if (extraFilters) filters.push(...extraFilters);
  return filters.length ? JSON.stringify(filters) : undefined;
}

export interface DirectPageOptions {
  accountId?: string;
  limit?: number;
  after?: string;          // cursor for next page
  search?: string;
  status?: string;
  campaignId?: string;
  adsetId?: string;
}

/** Fetch one page of campaigns from Meta API directly */
export function fetchCampaignsPage(opts: DirectPageOptions = {}) {
  const id = opts.accountId || getDefaultAccountId();
  const params: Record<string, string> = {
    fields: CAMPAIGN_FIELDS,
    summary: 'true',
    limit: String(opts.limit || 10),
  };
  if (opts.after) params.after = opts.after;

  const extraFilters: { field: string; operator: string; value: string }[] = [];
  if (opts.status) {
    extraFilters.push({ field: 'effective_status', operator: 'IN', value: `["${opts.status}"]` });
  }
  const filtering = buildFiltering(opts.search, extraFilters);
  if (filtering) params.filtering = filtering;

  const cacheKey = `meta:page:campaigns:${id}:${JSON.stringify(params)}`;
  return cachedFetch(cacheKey, () =>
    metaFetchPage(`/${id}/campaigns`, params),
    CACHE_TTL,
  );
}

/** Fetch one page of ad sets from Meta API directly */
export function fetchAdSetsPage(opts: DirectPageOptions = {}) {
  const id = opts.accountId || getDefaultAccountId();
  const params: Record<string, string> = {
    fields: ADSET_FIELDS,
    summary: 'true',
    limit: String(opts.limit || 10),
  };
  if (opts.after) params.after = opts.after;

  const extraFilters: { field: string; operator: string; value: string }[] = [];
  if (opts.campaignId) {
    extraFilters.push({ field: 'campaign.id', operator: 'EQUAL', value: opts.campaignId });
  }
  const filtering = buildFiltering(opts.search, extraFilters);
  if (filtering) params.filtering = filtering;

  const cacheKey = `meta:page:adsets:${id}:${JSON.stringify(params)}`;
  return cachedFetch(cacheKey, () =>
    metaFetchPage(`/${id}/adsets`, params),
    CACHE_TTL,
  );
}

/** Fetch one page of ads from Meta API directly */
export function fetchAdsPage(opts: DirectPageOptions = {}) {
  const id = opts.accountId || getDefaultAccountId();
  const params: Record<string, string> = {
    fields: AD_FIELDS,
    summary: 'true',
    limit: String(opts.limit || 10),
  };
  if (opts.after) params.after = opts.after;

  const extraFilters: { field: string; operator: string; value: string }[] = [];
  if (opts.adsetId) {
    extraFilters.push({ field: 'adset.id', operator: 'EQUAL', value: opts.adsetId });
  }
  const filtering = buildFiltering(opts.search, extraFilters);
  if (filtering) params.filtering = filtering;

  const cacheKey = `meta:page:ads:${id}:${JSON.stringify(params)}`;
  return cachedFetch(cacheKey, () =>
    metaFetchPage(`/${id}/ads`, params),
    CACHE_TTL,
  );
}

// ───────────────────────────────────────────────
// Insights fetchers (cached per preset + account)
// ───────────────────────────────────────────────

/** Account-level insights */
export function fetchAccountInsights(
  datePreset = 'last_30d',
  timeIncrement?: string,
  accountId?: string,
) {
  const id = accountId || getDefaultAccountId();
  const cacheKey = `meta:insights:${id}:${datePreset}:${timeIncrement || 'none'}`;
  return cachedFetch(cacheKey, async () => {
    const params: Record<string, string> = {
      fields: [
        'spend', 'impressions', 'clicks', 'cpc', 'cpm', 'ctr',
        'reach', 'frequency', 'actions', 'cost_per_action_type',
        'date_start', 'date_stop',
      ].join(','),
      date_preset: datePreset,
    };
    if (timeIncrement) params.time_increment = timeIncrement;
    return metaFetchAll(`/${id}/insights`, params);
  }, CACHE_TTL);
}

/** Campaign-level insights */
export function fetchCampaignInsights(
  datePreset = 'last_30d',
  timeIncrement?: string,
  accountId?: string,
) {
  const id = accountId || getDefaultAccountId();
  const cacheKey = `meta:c-insights:${id}:${datePreset}:${timeIncrement || 'none'}`;
  return cachedFetch(cacheKey, async () => {
    const params: Record<string, string> = {
      fields: [
        'campaign_id', 'campaign_name',
        'spend', 'impressions', 'clicks', 'cpc', 'cpm', 'ctr',
        'reach', 'frequency', 'actions', 'cost_per_action_type',
        'date_start', 'date_stop',
      ].join(','),
      level: 'campaign',
      date_preset: datePreset,
    };
    if (timeIncrement) params.time_increment = timeIncrement;
    return metaFetchAll(`/${id}/insights`, params);
  }, CACHE_TTL);
}

/** Daily spend breakdown for charts */
export function fetchDailySpend(datePreset = 'last_30d', accountId?: string) {
  const id = accountId || getDefaultAccountId();
  return cachedFetch(`meta:daily-spend:${id}:${datePreset}`, () =>
    metaFetchAll(`/${id}/insights`, {
      fields: 'spend,impressions,clicks,reach,date_start,date_stop',
      date_preset: datePreset,
      time_increment: '1',
    }),
    CACHE_TTL,
  );
}

/** Demographic breakdowns */
export function fetchDemographics(datePreset = 'last_30d', accountId?: string) {
  const id = accountId || getDefaultAccountId();
  return cachedFetch(`meta:demographics:${id}:${datePreset}`, async () => {
    const [ageGender, country] = await Promise.all([
      metaFetchAll(`/${id}/insights`, {
        fields: 'spend,impressions,clicks,reach',
        date_preset: datePreset,
        breakdowns: 'age,gender',
      }),
      metaFetchAll(`/${id}/insights`, {
        fields: 'spend,impressions,clicks,reach',
        date_preset: datePreset,
        breakdowns: 'country',
      }),
    ]);
    return { ageGender, country };
  }, CACHE_TTL);
}

/**
 * Fetch campaign names for dropdowns (cached per account, 5 min).
 * Uses a single Meta API call with limit=500 for just id+name.
 */
export function fetchCampaignNames(accountId?: string) {
  const id = accountId || getDefaultAccountId();
  return cachedFetch(`meta:campaign-names:${id}`, () =>
    metaFetchAll(`/${id}/campaigns`, {
      fields: 'id,name',
    }, 3),
    5 * 60 * 1000,
  );
}
