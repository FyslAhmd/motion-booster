/**
 * Meta Marketing API client – server-side only.
 * All Graph API calls are funnelled through this module so the
 * access-token never leaks to the browser.
 */

const GRAPH_BASE = 'https://graph.facebook.com/v25.0';

function getToken(): string {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error('META_ACCESS_TOKEN is not configured');
  return token;
}

function getAdAccountId(): string {
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

  const res = await fetch(url.toString(), {
    next: { revalidate: 0 }, // no cache – always fresh
  });

  const json = await res.json();

  if ((json as MetaError).error) {
    const e = (json as MetaError).error;
    throw new Error(`Meta API ${e.code}: ${e.message}`);
  }

  return json as T;
}

// ───────────────────────────────────────────────
// Paginated fetch helper
// ───────────────────────────────────────────────

interface PaginatedResponse<T> {
  data: T[];
  paging?: {
    cursors?: { before?: string; after?: string };
    next?: string;
  };
}

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

    const res = await metaFetch<PaginatedResponse<T>>(path, p);
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

/** Ad account info */
export async function fetchAdAccount() {
  const id = getAdAccountId();
  return metaFetch(`/${id}`, {
    fields: [
      'id', 'name', 'account_status', 'currency', 'amount_spent',
      'balance', 'spend_cap', 'business_name', 'timezone_name',
      'min_daily_budget', 'created_time',
    ].join(','),
  });
}

/** All ad accounts for this token (for discovery) */
export async function fetchAdAccounts() {
  return metaFetchAll('/me/adaccounts', {
    fields: 'id,name,account_status,currency,amount_spent',
  });
}

/** Campaigns list */
export async function fetchCampaigns(status?: string) {
  const id = getAdAccountId();
  const params: Record<string, string> = {
    fields: [
      'id', 'name', 'objective', 'status', 'effective_status',
      'daily_budget', 'lifetime_budget', 'budget_remaining',
      'start_time', 'stop_time', 'created_time', 'updated_time',
    ].join(','),
  };
  if (status) {
    params.effective_status = JSON.stringify([status]);
  }
  return metaFetchAll(`/${id}/campaigns`, params);
}

/** Ad sets list */
export async function fetchAdSets(campaignId?: string) {
  const id = getAdAccountId();
  const params: Record<string, string> = {
    fields: [
      'id', 'name', 'status', 'effective_status', 'campaign_id',
      'daily_budget', 'lifetime_budget', 'budget_remaining',
      'bid_amount', 'billing_event', 'optimization_goal',
      'start_time', 'end_time', 'created_time', 'targeting',
    ].join(','),
  };
  if (campaignId) {
    params.filtering = JSON.stringify([
      { field: 'campaign.id', operator: 'EQUAL', value: campaignId },
    ]);
  }
  return metaFetchAll(`/${id}/adsets`, params);
}

/** Ads list */
export async function fetchAds(adsetId?: string) {
  const id = getAdAccountId();
  const params: Record<string, string> = {
    fields: [
      'id', 'name', 'status', 'effective_status',
      'adset_id', 'campaign_id', 'created_time',
      'creative{id,name,thumbnail_url,body,title,image_url,object_story_spec}',
    ].join(','),
  };
  if (adsetId) {
    params.filtering = JSON.stringify([
      { field: 'adset.id', operator: 'EQUAL', value: adsetId },
    ]);
  }
  return metaFetchAll(`/${id}/ads`, params);
}

/** Account-level insights */
export async function fetchAccountInsights(
  datePreset = 'last_30d',
  timeIncrement?: string,
) {
  const id = getAdAccountId();
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
}

/** Campaign-level insights */
export async function fetchCampaignInsights(
  datePreset = 'last_30d',
  timeIncrement?: string,
) {
  const id = getAdAccountId();
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
}

/** Daily spend breakdown for charts */
export async function fetchDailySpend(datePreset = 'last_30d') {
  const id = getAdAccountId();
  return metaFetchAll(`/${id}/insights`, {
    fields: 'spend,impressions,clicks,reach,date_start,date_stop',
    date_preset: datePreset,
    time_increment: '1',
  });
}

/** Demographic breakdowns */
export async function fetchDemographics(datePreset = 'last_30d') {
  const id = getAdAccountId();

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
}
