'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import DatePresetSelector from '../meta/_components/DatePresetSelector';
import InsightsCards from '../meta/_components/InsightsCards';
import SpendChart from '../meta/_components/SpendChart';
import type { InsightRow } from '../meta/_components/useMetaData';
import { useAuth } from '@/lib/auth/context';

type DatePreset =
  | 'today'
  | 'yesterday'
  | 'last_7d'
  | 'last_14d'
  | 'last_30d'
  | 'last_90d'
  | 'this_month'
  | 'last_month'
  | 'maximum'
  | 'custom';

type AssignmentRef = {
  metaObjectId: string;
  metaAccountId: string;
};

type UserBudgetRow = {
  id: string;
  totalBudget?: number;
  balance?: number;
  createdAt?: string;
};

type AssignmentsResponse = {
  success?: boolean;
  data?: {
    campaigns?: AssignmentRef[];
  };
};

type UserBudgetsResponse = {
  success?: boolean;
  data?: UserBudgetRow[];
};

type SectionSummary = {
  totalSpend: number;
  balance: number | null;
  joinedDate: string | null;
};

function toUsd(value?: string) {
  const n = Number.parseFloat(String(value ?? '0'));
  return Number.isFinite(n) ? n : 0;
}

function toInt(value?: string) {
  const n = Number.parseInt(String(value ?? '0'), 10);
  return Number.isFinite(n) ? n : 0;
}

function buildDateQuery(preset: DatePreset, since: string, until: string) {
  if (preset === 'custom' && since && until) {
    return `since=${encodeURIComponent(since)}&until=${encodeURIComponent(until)}`;
  }
  return `date_preset=${preset}`;
}

function formatUsd(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatJoinedDate(date: string | null) {
  if (!date) return '-';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function ClientOverviewCard({ summary }: { summary: SectionSummary }) {
  const infoItems = [
    { label: 'Total Spend', value: formatUsd(summary.totalSpend), highlight: true },
    { label: 'Balance', value: summary.balance == null ? '-' : formatUsd(summary.balance), highlight: false },
    { label: 'Joined Date', value: formatJoinedDate(summary.joinedDate), highlight: false },
  ];

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {infoItems.map((item) => (
          <div key={item.label} className="min-w-0">
            <p className="text-xs text-gray-400 truncate">{item.label}</p>
            <p className={`mt-0.5 text-sm font-semibold truncate ${item.highlight ? 'text-red-600' : 'text-gray-800'}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetaOverviewCardsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="skeleton-breathe h-4 w-44 rounded-lg bg-gray-200/80" />
            <div className="skeleton-breathe h-3 w-28 rounded-lg bg-gray-200/80" />
          </div>
          <div className="skeleton-breathe h-6 w-20 rounded-full bg-gray-200/80" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`acc-skeleton-${i}`} className="space-y-1.5">
              <div className="skeleton-breathe h-3 w-16 rounded-lg bg-gray-200/80" />
              <div className="skeleton-breathe h-4 w-24 rounded-lg bg-gray-200/80" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`insight-skeleton-${i}`} className="rounded-xl border border-gray-100 bg-white p-4">
            <div className="skeleton-breathe h-3 w-16 rounded-lg bg-gray-200/80" />
            <div className="skeleton-breathe mt-2 h-4 w-20 rounded-lg bg-gray-200/80" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b border-gray-50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="skeleton-breathe h-9 w-9 rounded-lg bg-gray-200/80" />
              <div className="space-y-1.5">
                <div className="skeleton-breathe h-4 w-28 rounded-lg bg-gray-200/80" />
                <div className="skeleton-breathe h-3 w-20 rounded-lg bg-gray-200/80" />
              </div>
            </div>
            <div className="skeleton-breathe h-8 w-42 rounded-lg bg-gray-200/80" />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`sum-skeleton-${i}`} className="rounded-lg bg-gray-50 px-3 py-2.5">
                <div className="skeleton-breathe h-3 w-14 rounded-lg bg-gray-200/80" />
                <div className="skeleton-breathe mt-2 h-4 w-16 rounded-lg bg-gray-200/80" />
              </div>
            ))}
          </div>
        </div>
        <div className="px-2 py-4">
          <div className="skeleton-breathe mx-3 h-60 rounded-2xl bg-gray-200/80" />
        </div>
      </div>
    </div>
  );
}

export default function ClientMetaOverviewSection() {
  const { user } = useAuth();
  const [datePreset, setDatePreset] = useState<DatePreset>('last_30d');
  const [customSince, setCustomSince] = useState('');
  const [customUntil, setCustomUntil] = useState('');
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [dailySpend, setDailySpend] = useState<InsightRow[]>([]);
  const [summary, setSummary] = useState<SectionSummary>({
    totalSpend: 0,
    balance: null,
    joinedDate: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user?.id) return;
    if (datePreset === 'custom' && (!customSince || !customUntil)) return;

    setLoading(true);
    setError('');

    try {
      const dateQ = buildDateQuery(datePreset, customSince, customUntil);

      const [assignRes, budgetRes] = await Promise.all([
        fetch(`/api/v1/admin/meta-assignments/users/${encodeURIComponent(user.id)}`, { cache: 'no-store' }),
        fetch('/api/v1/admin/user-budgets', { cache: 'no-store', credentials: 'include' }),
      ]);

      const assignJson = (await assignRes.json()) as AssignmentsResponse;
      const budgetJson = (await budgetRes.json()) as UserBudgetsResponse;

      if (!assignJson?.success) {
        throw new Error('Failed to load assigned campaigns');
      }

      const campaigns = Array.isArray(assignJson?.data?.campaigns) ? assignJson.data.campaigns : [];
      const grouped = new Map<string, Set<string>>();
      for (const row of campaigns) {
        if (!row?.metaAccountId || !row?.metaObjectId) continue;
        if (!grouped.has(row.metaAccountId)) grouped.set(row.metaAccountId, new Set());
        grouped.get(row.metaAccountId)?.add(row.metaObjectId);
      }

      const userBudgetRow = Array.isArray(budgetJson?.data)
        ? budgetJson.data.find((r) => r.id === user.id)
        : null;

      const periodRowsByAccount = await Promise.all(
        Array.from(grouped.entries()).map(async ([accountId, ids]) => {
          const [periodRes, dailyRes, maxRes] = await Promise.all([
            fetch(`/api/v1/meta/insights?type=campaigns&${dateQ}&account_id=${encodeURIComponent(accountId)}`, {
              cache: 'no-store',
            }).then((r) => r.json()),
            fetch(`/api/v1/meta/insights?type=campaigns&${dateQ}&time_increment=1&account_id=${encodeURIComponent(accountId)}`, {
              cache: 'no-store',
            }).then((r) => r.json()),
            fetch(`/api/v1/meta/insights?type=campaigns&date_preset=maximum&account_id=${encodeURIComponent(accountId)}`, {
              cache: 'no-store',
            }).then((r) => r.json()),
          ]);

          const periodRows: InsightRow[] = Array.isArray(periodRes?.data)
            ? periodRes.data.filter((row: InsightRow) => row.campaign_id && ids.has(String(row.campaign_id)))
            : [];

          const dailyRows: InsightRow[] = Array.isArray(dailyRes?.data)
            ? dailyRes.data.filter((row: InsightRow) => row.campaign_id && ids.has(String(row.campaign_id)))
            : [];

          const maxRows: InsightRow[] = Array.isArray(maxRes?.data)
            ? maxRes.data.filter((row: InsightRow) => row.campaign_id && ids.has(String(row.campaign_id)))
            : [];

          return { periodRows, dailyRows, maxRows };
        }),
      );

      const flatPeriodRows = periodRowsByAccount.flatMap((entry) => entry.periodRows);
      const flatDailyRows = periodRowsByAccount.flatMap((entry) => entry.dailyRows);
      const flatMaxRows = periodRowsByAccount.flatMap((entry) => entry.maxRows);

      let spend = 0;
      let reach = 0;
      let impressions = 0;
      let clicks = 0;

      for (const row of flatPeriodRows) {
        spend += toUsd(row.spend);
        reach += toInt(row.reach);
        impressions += toInt(row.impressions);
        clicks += toInt(row.clicks);
      }

      const dailyMap = new Map<string, { spend: number; reach: number; impressions: number }>();
      for (const row of flatDailyRows) {
        const rowSpend = toUsd(row.spend);
        const rowReach = toInt(row.reach);
        const rowImpressions = toInt(row.impressions);

        const key = row.date_start;
        const prev = dailyMap.get(key) ?? { spend: 0, reach: 0, impressions: 0 };
        dailyMap.set(key, {
          spend: prev.spend + rowSpend,
          reach: prev.reach + rowReach,
          impressions: prev.impressions + rowImpressions,
        });
      }

      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const cpc = clicks > 0 ? spend / clicks : 0;
      const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
      const frequency = reach > 0 ? impressions / reach : 0;

      const aggregatedInsight: InsightRow[] =
        flatPeriodRows.length === 0
          ? []
          : [
              {
                spend: spend.toFixed(2),
                reach: String(reach),
                impressions: String(impressions),
                clicks: String(clicks),
                ctr: ctr.toFixed(2),
                cpc: cpc.toFixed(2),
                cpm: cpm.toFixed(2),
                frequency: frequency.toFixed(2),
                date_start: flatPeriodRows[0]?.date_start || '',
                date_stop: flatPeriodRows[flatPeriodRows.length - 1]?.date_stop || '',
              },
            ];

      const dailyRows: InsightRow[] = Array.from(dailyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, val]) => ({
          date_start: date,
          date_stop: date,
          spend: val.spend.toFixed(2),
          reach: String(val.reach),
          impressions: String(val.impressions),
        }));

      const totalSpend = flatMaxRows.reduce((sum, row) => sum + toUsd(row.spend), 0);

      setSummary({
        totalSpend,
        balance: userBudgetRow ? Number(userBudgetRow.balance || 0) : null,
        joinedDate: userBudgetRow?.createdAt || null,
      });
      setInsights(aggregatedInsight);
      setDailySpend(dailyRows);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load Meta data';
      setError(msg);
      setInsights([]);
      setDailySpend([]);
      setSummary((prev) => ({ ...prev, totalSpend: 0 }));
    } finally {
      setLoading(false);
    }
  }, [customSince, customUntil, datePreset, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="w-full min-w-0 sm:rounded-2xl sm:border sm:border-gray-100 sm:bg-white sm:p-6 space-y-5">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">Meta Ads Performance</h2>
          <p className="text-xs text-gray-500 mt-0.5">Stats based on campaigns assigned to your account</p>
        </div>
        <div className="flex min-w-0 items-start gap-2 sm:max-w-xs">
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
            onClick={() => load()}
            disabled={loading}
            className="mt-0.5 shrink-0 rounded-lg border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {datePreset === 'custom' && (!customSince || !customUntil) && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Select both a start and end date to load data.
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {loading ? (
        <MetaOverviewCardsSkeleton />
      ) : (
        <div className="space-y-5">
          <ClientOverviewCard summary={summary} />
          <InsightsCards insights={insights} />
          <SpendChart data={dailySpend} />
        </div>
      )}
    </div>
  );
}
