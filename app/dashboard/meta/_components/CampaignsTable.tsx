'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Campaign {
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
}

interface CursorPaging {
  cursors?: { before?: string; after?: string };
  next?: string;
  previous?: string;
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

function fmtDate(val?: string) {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface CampaignsTableProps {
  accountId?: string;
}

export default function CampaignsTable({ accountId }: CampaignsTableProps) {
  const [data, setData] = useState<Campaign[]>([]);
  const [paging, setPaging] = useState<CursorPaging | null>(null);
  const [cursorStack, setCursorStack] = useState<string[]>([]);  // stack of "after" cursors for prev navigation
  const [currentAfter, setCurrentAfter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageNum, setPageNum] = useState(1);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

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

        const res = await fetch(`/api/v1/meta/campaigns?${p}`, { signal: controller.signal });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          setPaging(json.paging || null);
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
  }, [currentAfter, search, accountId]);

  const goNext = () => {
    if (paging?.cursors?.after && paging.next) {
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

  // Reset pagination when account changes
  useEffect(() => {
    setCurrentAfter(undefined);
    setCursorStack([]);
    setPageNum(1);
    setSearch('');
  }, [accountId]);

  const hasNext = !!paging?.next;
  const hasPrev = cursorStack.length > 0;

  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      {/* Controls */}
<<<<<<< HEAD
      <div className="flex flex-col gap-3 border-b border-gray-700/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-gray-300">
          Campaigns
=======
      <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Campaigns <span className="ml-1 text-xs text-gray-500">({pagination.total})</span>
>>>>>>> 9e38dd9 (updated dashbopard ui)
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
              placeholder="Search campaigns..."
              className="w-52 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-400 focus:outline-none"
            />
          </div>
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
            <div className="px-6 py-10 text-center text-sm text-gray-500">No campaigns found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                    <th className="px-6 py-3 font-medium">Campaign</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Objective</th>
                    <th className="px-4 py-3 font-medium text-right">Budget</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Date Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((c) => {
                    const color = STATUS_COLORS[c.effective_status] || 'bg-gray-100 text-gray-500';
                    return (
                      <tr key={c.id} className="transition-colors hover:bg-gray-50">
                        <td className="max-w-[220px] truncate px-6 py-3 font-medium text-gray-900">{c.name}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{c.effective_status}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-400">{c.objective?.replace(/_/g, ' ') || '—'}</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {c.daily_budget ? `${fmtBudget(c.daily_budget)}/day` : c.lifetime_budget ? `${fmtBudget(c.lifetime_budget)} life` : '—'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{fmtDate(c.created_time)}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                          {fmtDate(c.start_time)}{c.stop_time ? ` → ${fmtDate(c.stop_time)}` : ' → Ongoing'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
<<<<<<< HEAD
          {(hasNext || hasPrev) && (
            <div className="flex items-center justify-between border-t border-gray-700/50 px-6 py-3">
              <p className="text-xs text-gray-500">Page {pageNum}</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={goPrev}
                  disabled={!hasPrev}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-700 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[32px] rounded-lg bg-purple-600 px-2 py-1 text-center text-xs font-medium text-white">
                  {pageNum}
                </span>
                <button
                  onClick={goNext}
                  disabled={!hasNext}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-700 disabled:opacity-30"
=======
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
              <p className="text-xs text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  let pg: number;
                  if (pagination.totalPages <= 5) pg = i + 1;
                  else if (pagination.page <= 3) pg = i + 1;
                  else if (pagination.page >= pagination.totalPages - 2) pg = pagination.totalPages - 4 + i;
                  else pg = pagination.page - 2 + i;
                  return (
                    <button
                      key={pg}
                      onClick={() => goPage(pg)}
                      className={`min-w-[32px] rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                        pg === pagination.page ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button
                  onClick={() => goPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
>>>>>>> 9e38dd9 (updated dashbopard ui)
                >
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
