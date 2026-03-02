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
  | 'last_month';

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Unknown error');
  return json.data as T;
}

export default function MetaOverviewSection() {
  const [datePreset, setDatePreset] = useState<DatePreset>('last_30d');
  const [accountId, setAccountId] = useState('');
  const [account, setAccount] = useState<MetaAccount | null>(null);
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [dailySpend, setDailySpend] = useState<InsightRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (preset: DatePreset, accId: string) => {
    if (!accId) return;
    setLoading(true);
    setError('');
    try {
      const q = `account_id=${encodeURIComponent(accId)}`;
      const [accRes, insRes, dailyRes] = await Promise.allSettled([
        apiFetch<MetaAccount>(`/api/v1/meta/account?${q}`),
        apiFetch<InsightRow[]>(
          `/api/v1/meta/insights?type=account&date_preset=${preset}&${q}`,
        ),
        apiFetch<InsightRow[]>(
          `/api/v1/meta/insights?type=daily&date_preset=${preset}&${q}`,
        ),
      ]);

      if (accRes.status === 'fulfilled') setAccount(accRes.value);
      if (insRes.status === 'fulfilled') setInsights(insRes.value);
      if (dailyRes.status === 'fulfilled') setDailySpend(dailyRes.value);

      const allFailed = [accRes, insRes, dailyRes].every(
        (r) => r.status === 'rejected',
      );
      if (allFailed) setError('Failed to fetch Meta data');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(datePreset, accountId);
  }, [datePreset, accountId, load]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-900 p-5 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-white">Meta Ads Performance</h2>
        <div className="flex flex-wrap items-center gap-2">
          <AccountSwitcher value={accountId} onChange={setAccountId} />
          <DatePresetSelector value={datePreset} onChange={setDatePreset} />
          <button
            onClick={() => load(datePreset, accountId)}
            disabled={loading}
            className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-gray-300 transition-colors hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
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
