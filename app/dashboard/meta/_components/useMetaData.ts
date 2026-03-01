'use client';

import { useState, useEffect, useCallback } from 'react';

type DatePreset = 'today' | 'yesterday' | 'last_7d' | 'last_14d' | 'last_30d' | 'last_90d' | 'this_month' | 'last_month';

// ─── Types ───────────────────────────────────────

export interface MetaAccount {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  amount_spent: string;
  balance: string;
  spend_cap: string;
  business_name: string;
  timezone_name: string;
  min_daily_budget: number;
  created_time: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  effective_status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  start_time?: string;
  stop_time?: string;
  created_time: string;
  updated_time?: string;
}

export interface MetaAdSet {
  id: string;
  name: string;
  status: string;
  effective_status: string;
  campaign_id: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  bid_amount?: string;
  billing_event?: string;
  optimization_goal?: string;
  start_time?: string;
  end_time?: string;
  created_time: string;
  targeting?: any;
}

export interface MetaAd {
  id: string;
  name: string;
  status: string;
  effective_status: string;
  adset_id: string;
  campaign_id: string;
  created_time: string;
  creative?: {
    id: string;
    name?: string;
    thumbnail_url?: string;
    body?: string;
    title?: string;
    image_url?: string;
  };
}

export interface InsightRow {
  spend?: string;
  impressions?: string;
  clicks?: string;
  cpc?: string;
  cpm?: string;
  ctr?: string;
  reach?: string;
  frequency?: string;
  date_start: string;
  date_stop: string;
  campaign_id?: string;
  campaign_name?: string;
  actions?: Array<{ action_type: string; value: string }>;
  cost_per_action_type?: Array<{ action_type: string; value: string }>;
  // demographics
  age?: string;
  gender?: string;
  country?: string;
}

// ─── Generic fetcher ─────────────────────────────

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Unknown error');
  return json.data as T;
}

// ─── Hook ────────────────────────────────────────

export function useMetaData() {
  const [datePreset, setDatePreset] = useState<DatePreset>('last_30d');
  const [account, setAccount] = useState<MetaAccount | null>(null);
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [adsets, setAdsets] = useState<MetaAdSet[]>([]);
  const [ads, setAds] = useState<MetaAd[]>([]);
  const [accountInsights, setAccountInsights] = useState<InsightRow[]>([]);
  const [campaignInsights, setCampaignInsights] = useState<InsightRow[]>([]);
  const [dailySpend, setDailySpend] = useState<InsightRow[]>([]);
  const [demographics, setDemographics] = useState<{
    ageGender: InsightRow[];
    country: InsightRow[];
  }>({ ageGender: [], country: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (preset: DatePreset) => {
    setLoading(true);
    setError(null);

    try {
      const [acc, camps, asets, adsList, accIns, campIns, daily, demo] =
        await Promise.allSettled([
          apiFetch<MetaAccount>('/api/v1/meta/account'),
          apiFetch<MetaCampaign[]>('/api/v1/meta/campaigns'),
          apiFetch<MetaAdSet[]>('/api/v1/meta/adsets'),
          apiFetch<MetaAd[]>('/api/v1/meta/ads'),
          apiFetch<InsightRow[]>(
            `/api/v1/meta/insights?type=account&date_preset=${preset}`,
          ),
          apiFetch<InsightRow[]>(
            `/api/v1/meta/insights?type=campaigns&date_preset=${preset}`,
          ),
          apiFetch<InsightRow[]>(
            `/api/v1/meta/insights?type=daily&date_preset=${preset}`,
          ),
          apiFetch<{ ageGender: InsightRow[]; country: InsightRow[] }>(
            `/api/v1/meta/insights?type=demographics&date_preset=${preset}`,
          ),
        ]);

      if (acc.status === 'fulfilled') setAccount(acc.value);
      if (camps.status === 'fulfilled') setCampaigns(camps.value);
      if (asets.status === 'fulfilled') setAdsets(asets.value);
      if (adsList.status === 'fulfilled') setAds(adsList.value);
      if (accIns.status === 'fulfilled') setAccountInsights(accIns.value);
      if (campIns.status === 'fulfilled') setCampaignInsights(campIns.value);
      if (daily.status === 'fulfilled') setDailySpend(daily.value);
      if (demo.status === 'fulfilled') setDemographics(demo.value);

      // If ALL failed, surface the first error
      const allFailed = [acc, camps, asets, adsList, accIns, campIns, daily, demo].every(
        (r) => r.status === 'rejected',
      );
      if (allFailed) {
        const first = [acc, camps, asets, adsList, accIns, campIns, daily, demo].find(
          (r) => r.status === 'rejected',
        ) as PromiseRejectedResult;
        setError(first.reason?.message || 'Failed to fetch Meta data');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(datePreset);
  }, [datePreset, load]);

  return {
    datePreset,
    setDatePreset,
    account,
    campaigns,
    adsets,
    ads,
    accountInsights,
    campaignInsights,
    dailySpend,
    demographics,
    loading,
    error,
    refresh: () => load(datePreset),
  };
}
