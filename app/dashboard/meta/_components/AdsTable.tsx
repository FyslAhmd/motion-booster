'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Ad {
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

interface AdsTableProps {
  accountId?: string;
}

export default function AdsTable({ accountId }: AdsTableProps) {
  const [data, setData] = useState<Ad[]>([]);
  const [paging, setPaging] = useState<CursorPaging | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [currentAfter, setCurrentAfter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageNum, setPageNum] = useState(1);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Fetch ads with cursor pagination
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

        const res = await fetch(`/api/v1/meta/ads?${p}`, { signal: controller.signal });
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
  }, [currentAfter, search, accountId]);

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

  // Reset pagination when account changes
  useEffect(() => {
    setCurrentAfter(undefined);
    setCursorStack([]);
    setPageNum(1);
    setSearch('');
  }, [accountId]);

  const hasNext = !!paging?.hasNext;
  const hasPrev = cursorStack.length > 0;
  const totalPages = totalCount != null ? Math.ceil(totalCount / 10) : null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      {/* Controls */}
      <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Ads {pageNum > 1 && <span className="ml-1 text-xs text-gray-500">Page {pageNum}{totalPages ? `/${totalPages}` : ''}</span>}
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
              placeholder="Search ads..."
              className="w-48 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-400 focus:outline-none"
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
            <div className="px-6 py-10 text-center text-sm text-gray-500">No ads found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                    <th className="px-6 py-3 font-medium">Preview</th>
                    <th className="px-4 py-3 font-medium">Ad Name</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Creative Title</th>
                    <th className="px-4 py-3 font-medium">Body</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((ad) => {
                    const color = STATUS_COLORS[ad.effective_status] || 'bg-gray-100 text-gray-500';
                    return (
                      <tr key={ad.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-6 py-3">
                          {ad.creative?.thumbnail_url ? (
                            <img
                              src={ad.creative.thumbnail_url}
                              alt={ad.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                              N/A
                            </div>
                          )}
                        </td>
                        <td className="max-w-[180px] truncate px-4 py-3 font-medium text-gray-900">{ad.name}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{ad.effective_status}</span>
                        </td>
                        <td className="max-w-[160px] truncate px-4 py-3 text-gray-400">{ad.creative?.title || '—'}</td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-xs text-gray-500">{ad.creative?.body || '—'}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                          {new Date(ad.created_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
