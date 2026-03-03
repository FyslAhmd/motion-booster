'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface AdSet {
  id: string;
  name: string;
  status: string;
  effective_status: string;
  campaign_id: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  optimization_goal?: string;
  start_time?: string;
  end_time?: string;
  created_time: string;
  targeting?: any;
}

interface CampaignOption {
  id: string;
  name: string;
}

interface CursorPaging {
  cursors?: { before?: string; after?: string };
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border border-green-200',
  PAUSED: 'bg-amber-50 text-amber-700 border border-amber-200',
  DELETED: 'bg-red-50 text-red-600 border border-red-200',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

function fmtBudget(val?: string) {
  if (!val) return '—';
  return `$${(parseInt(val, 10) / 100).toFixed(2)}`;
}

function summarizeTargeting(t: any): string {
  if (!t) return '—';
  const parts: string[] = [];
  if (t.age_min || t.age_max) parts.push(`Age ${t.age_min || '?'}–${t.age_max || '?'}`);
  if (t.genders?.length) parts.push(t.genders.map((v: number) => (v === 1 ? 'M' : v === 2 ? 'F' : 'All')).join(', '));
  if (t.geo_locations?.countries?.length) parts.push(t.geo_locations.countries.join(', '));
  if (t.interests?.length) parts.push(`${t.interests.length} interest(s)`);
  return parts.length ? parts.join(' · ') : '—';
}

interface AdSetsTableProps {
  accountId?: string;
}

export default function AdSetsTable({ accountId }: AdSetsTableProps) {
  const [data, setData] = useState<AdSet[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [filterCampaign, setFilterCampaign] = useState('all');
  const [paging, setPaging] = useState<CursorPaging | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [currentAfter, setCurrentAfter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageNum, setPageNum] = useState(1);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Fetch campaign names for dropdown (lightweight endpoint, cached 5 min)
  useEffect(() => {
    const p = new URLSearchParams();
    p.set('names_only', '1');
    if (accountId) p.set('account_id', accountId);
    fetch(`/api/v1/meta/campaigns?${p}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCampaigns(json.data.map((c: any) => ({ id: c.id, name: c.name })));
      })
      .catch(() => {});
  }, [accountId]);

  // Fetch ad sets with cursor pagination
  useEffect(() => {
    const controller = new AbortController();

    const doFetch = async () => {
      setLoading(true);
      setError('');
      try {
        const p = new URLSearchParams({ limit: '10' });
        if (accountId) p.set('account_id', accountId);
        if (search) p.set('search', search);
        if (currentAfter) p.set('after', currentAfter);
        if (filterCampaign !== 'all') p.set('campaign_id', filterCampaign);

        const res = await fetch(`/api/v1/meta/adsets?${p}`, { signal: controller.signal });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          setPaging(json.paging || null);
          if (json.totalCount != null) setTotalCount(json.totalCount);
        } else {
          setError(json.error || 'Failed to load');
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    doFetch();
    return () => controller.abort();
  }, [currentAfter, search, filterCampaign, accountId]);

  const goNext = () => {
    if (paging?.cursors?.after && paging.hasNext) {
      setCursorStack((prev) => [...prev, currentAfter || '__first__']);
      setCurrentAfter(paging.cursors.after);
      setPageNum((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (cursorStack.length > 0) {
      const stack = [...cursorStack];
      const prev = stack.pop()!;
      setCursorStack(stack);
      setCurrentAfter(prev === '__first__' ? undefined : prev);
      setPageNum((p) => Math.max(1, p - 1));
    }
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentAfter(undefined);
    setCursorStack([]);
    setPageNum(1);
  };

  const handleCampaignFilter = (val: string) => {
    setFilterCampaign(val);
    setCurrentAfter(undefined);
    setCursorStack([]);
    setPageNum(1);
  };

  // Reset pagination when account changes
  useEffect(() => {
    setCurrentAfter(undefined);
    setCursorStack([]);
    setPageNum(1);
    setSearch('');
    setFilterCampaign('all');
  }, [accountId]);

  const hasNext = !!paging?.hasNext;
  const hasPrev = cursorStack.length > 0;
  const totalPages = totalCount != null ? Math.ceil(totalCount / 10) : null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      {/* Controls */}
      <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Ad Sets {pageNum > 1 && <span className="ml-1 text-xs text-gray-500">Page {pageNum}{totalPages ? `/${totalPages}` : ''}</span>}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                const val = e.target.value;
                setSearch(val);
                clearTimeout(searchTimerRef.current);
                searchTimerRef.current = setTimeout(() => handleSearch(val), 400);
              }}
              placeholder="Search ad sets..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-400 focus:outline-none sm:w-48"
            />
          </div>
          {campaigns.length > 0 && (
            <select
              value={filterCampaign}
              onChange={(e) => handleCampaignFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-700 focus:ring-2 focus:ring-red-400 focus:outline-none sm:w-auto"
            >
              <option value="all">All campaigns</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-red-500" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="px-6 py-10 text-center text-sm text-red-400">{error}</div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          {data.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-500">No ad sets found.</div>
          ) : (
            <>
              {/* Mobile card list */}
              <div className="divide-y divide-gray-100 sm:hidden">
                {data.map((a) => {
                  const color = STATUS_COLORS[a.effective_status] || 'bg-gray-100 text-gray-500';
                  return (
                    <div key={a.id} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{a.name}</p>
                        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{a.effective_status}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                        <span>{a.daily_budget ? `${fmtBudget(a.daily_budget)}/day` : a.lifetime_budget ? `${fmtBudget(a.lifetime_budget)} lifetime` : '—'}</span>
                        <span className="text-gray-400">{a.optimization_goal?.replace(/_/g, ' ') || '—'}</span>
                      </div>
                      {summarizeTargeting(a.targeting) !== '—' && (
                        <p className="mt-0.5 truncate text-xs text-gray-400">{summarizeTargeting(a.targeting)}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                      <th className="px-6 py-3 font-medium">Ad Set</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Optimization</th>
                      <th className="px-4 py-3 font-medium text-right">Budget</th>
                      <th className="px-4 py-3 font-medium">Targeting</th>
                      <th className="px-4 py-3 font-medium">Schedule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((a) => {
                      const color = STATUS_COLORS[a.effective_status] || 'bg-gray-100 text-gray-500';
                      return (
                        <tr key={a.id} className="transition-colors hover:bg-gray-50">
                          <td className="max-w-[200px] truncate px-6 py-3 font-medium text-gray-900">{a.name}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{a.effective_status}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{a.optimization_goal?.replace(/_/g, ' ') || '—'}</td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {a.daily_budget ? `${fmtBudget(a.daily_budget)}/day` : a.lifetime_budget ? `${fmtBudget(a.lifetime_budget)} life` : '—'}
                          </td>
                          <td className="max-w-[220px] truncate px-4 py-3 text-xs text-gray-400">{summarizeTargeting(a.targeting)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                            {a.start_time ? new Date(a.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                            {a.end_time ? ` → ${new Date(a.end_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          {(hasNext || hasPrev) && (
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
              <p className="text-xs text-gray-500">Page {pageNum}{totalPages ? ` / ${totalPages}` : ''}</p>
              <div className="flex items-center gap-1">
                <button onClick={goPrev} disabled={!hasPrev} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[32px] rounded-lg bg-red-600 px-2 py-1 text-center text-xs font-medium text-white">{pageNum}{totalPages ? `/${totalPages}` : ''}</span>
                <button onClick={goNext} disabled={!hasNext} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
