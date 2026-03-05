'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import AccountOverview from '../meta/_components/AccountOverview';
import AccountSwitcher from '../meta/_components/AccountSwitcher';
import InsightsCards from '../meta/_components/InsightsCards';
import SpendChart from '../meta/_components/SpendChart';
import DatePresetSelector from '../meta/_components/DatePresetSelector';
import type { MetaAccount, InsightRow } from '../meta/_components/useMetaData';

type DatePreset =
  | 'today'
  | 'yesterday'
  | 'last_7d'
  | 'last_14d'
  | 'last_30d'
  | 'last_90d'
  | 'this_month'
  | 'last_month'
  | 'custom';

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Unknown error');
  return json.data as T;
}

export default function MetaOverviewSection() {
  const [datePreset, setDatePreset] = useState<DatePreset>('last_30d');
  const [customSince, setCustomSince] = useState('');
  const [customUntil, setCustomUntil] = useState('');
  const [accountId, setAccountId] = useState('act_586481100654531');
  const [account, setAccount] = useState<MetaAccount | null>(null);
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [dailySpend, setDailySpend] = useState<InsightRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function buildDateQuery(preset: DatePreset, since: string, until: string) {
    if (preset === 'custom' && since && until) {
      return `since=${encodeURIComponent(since)}&until=${encodeURIComponent(until)}`;
    }
    return `date_preset=${preset}`;
  }

  const load = useCallback(async (preset: DatePreset, accId: string, since: string, until: string) => {
    if (!accId) return;
    if (preset === 'custom' && (!since || !until)) return; // wait until both dates are set
    setLoading(true);
    setError('');
    try {
      const q = `account_id=${encodeURIComponent(accId)}`;
      const dateQ = buildDateQuery(preset, since, until);
      const [accRes, insRes, dailyRes] = await Promise.allSettled([
        apiFetch<MetaAccount>(`/api/v1/meta/account?${q}`),
        apiFetch<InsightRow[]>(`/api/v1/meta/insights?type=account&${dateQ}&${q}`),
        apiFetch<InsightRow[]>(`/api/v1/meta/insights?type=daily&${dateQ}&${q}`),
      ]);

      if (accRes.status === 'fulfilled') setAccount(accRes.value);
      if (insRes.status === 'fulfilled') setInsights(insRes.value);
      if (dailyRes.status === 'fulfilled') setDailySpend(dailyRes.value);

      const allFailed = [accRes, insRes, dailyRes].every((r) => r.status === 'rejected');
      if (allFailed) setError('Failed to fetch Meta data');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(datePreset, accountId, customSince, customUntil);
  }, [datePreset, accountId, customSince, customUntil, load]);

  return (
    <div className="w-full min-w-0 sm:rounded-2xl sm:border sm:border-gray-100 sm:bg-white sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Meta Ads Performance</h2>
          <p className="text-xs text-gray-500 mt-0.5">Live data from your connected ad account</p>
        </div>
        {/* Mobile: stacked | Desktop: single row */}
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="w-full sm:w-auto sm:shrink-0">
            <AccountSwitcher value={accountId} onChange={setAccountId} />
          </div>
          <div className="flex min-w-0 flex-1 items-start gap-2">
            <div className="min-w-0 flex-1">
              <DatePresetSelector
                value={datePreset}
                onChange={(v) => setDatePreset(v as DatePreset)}
                customSince={customSince}
                customUntil={customUntil}
                onCustomChange={(since, until) => {
                  setCustomSince(since);
                  setCustomUntil(until);
                }}
              />
            </div>
            <button
              onClick={() => load(datePreset, accountId, customSince, customUntil)}
              disabled={loading}
              className="mt-0.5 shrink-0 rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Custom date hint */}
      {datePreset === 'custom' && (!customSince || !customUntil) && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Select both a start and end date to load data.
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-5">
          <AccountOverview account={account} />
          <InsightsCards insights={insights} />
          <SpendChart data={dailySpend} />
        </div>
      )}
    </div>
  );
}
