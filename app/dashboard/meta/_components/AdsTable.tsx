'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import DateRangeFilter from './DateRangeFilter';

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

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400',
  PAUSED: 'bg-yellow-500/20 text-yellow-400',
  DELETED: 'bg-red-500/20 text-red-400',
  ARCHIVED: 'bg-gray-500/20 text-gray-400',
};

export default function AdsTable() {
  const [data, setData] = useState<Ad[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const p = new URLSearchParams({ page: String(pagination.page), limit: '10' });
        if (search) p.set('search', search);
        if (dateFrom) p.set('date_from', dateFrom);
        if (dateTo) p.set('date_to', dateTo);

        const res = await fetch(`/api/v1/meta/ads?${p}`, { signal: controller.signal });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          setPagination(json.pagination);
        } else {
          setError(json.error || 'Failed to load');
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [pagination.page, search, dateFrom, dateTo]);

  const goPage = (pg: number) => setPagination((prev) => ({ ...prev, page: pg }));

  const handleSearch = (val: string) => {
    setSearch(val);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDateChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/50">
      {/* Controls */}
      <div className="flex flex-col gap-3 border-b border-gray-700/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-gray-300">
          Ads <span className="ml-1 text-xs text-gray-500">({pagination.total})</span>
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search ads..."
              className="w-48 rounded-lg border border-gray-700 bg-gray-900 py-2 pl-9 pr-3 text-sm text-gray-200 placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <DateRangeFilter onDateChange={handleDateChange} />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
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
                  <tr className="border-b border-gray-700/50 text-xs uppercase text-gray-500">
                    <th className="px-6 py-3 font-medium">Preview</th>
                    <th className="px-4 py-3 font-medium">Ad Name</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Creative Title</th>
                    <th className="px-4 py-3 font-medium">Body</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {data.map((ad) => {
                    const color = STATUS_COLORS[ad.effective_status] || 'bg-gray-500/20 text-gray-400';
                    return (
                      <tr key={ad.id} className="transition-colors hover:bg-gray-700/20">
                        <td className="px-6 py-3">
                          {ad.creative?.thumbnail_url ? (
                            <img
                              src={ad.creative.thumbnail_url}
                              alt={ad.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-700 text-xs text-gray-500">
                              N/A
                            </div>
                          )}
                        </td>
                        <td className="max-w-[180px] truncate px-4 py-3 font-medium text-gray-200">{ad.name}</td>
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
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-700/50 px-6 py-3">
              <p className="text-xs text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => goPage(pagination.page - 1)} disabled={pagination.page <= 1} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-700 disabled:opacity-30">
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
                        pg === pagination.page ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {pg}
                    </button>
                  );
                })}
                <button onClick={() => goPage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-700 disabled:opacity-30">
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
