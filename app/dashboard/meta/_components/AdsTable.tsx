'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import AssignUserDropdown from './AssignUserDropdown';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { toast } from 'sonner';

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
  /** Computed by backend via deriveAdStatus — always present in API response */
  derived_status?: { label: string; key: string };
}

interface CursorPaging {
  cursors?: { before?: string; after?: string };
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  ACTIVE:              { color: 'bg-green-50 text-green-700 border border-green-200',   label: 'Active' },
  PAUSED:              { color: 'bg-amber-50 text-amber-700 border border-amber-200',   label: 'Paused' },
  CAMPAIGN_PAUSED:     { color: 'bg-amber-50 text-amber-600 border border-amber-200',   label: 'Campaign Off' },
  ADSET_PAUSED:        { color: 'bg-amber-50 text-amber-600 border border-amber-200',   label: 'Ad Set Off' },
  IN_PROCESS:          { color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', label: 'In Review' },
  WITH_ISSUES:         { color: 'bg-orange-50 text-orange-600 border border-orange-200', label: 'Issues' },
  PENDING_REVIEW:      { color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', label: 'Pending Review' },
  DISAPPROVED:         { color: 'bg-red-50 text-red-600 border border-red-200',          label: 'Not Approved' },
  PENDING_BILLING_INFO:{ color: 'bg-orange-50 text-orange-600 border border-orange-200', label: 'Billing Issue' },
  PREAPPROVED:         { color: 'bg-blue-50 text-blue-600 border border-blue-200',       label: 'Preapproved' },
  DELETED:             { color: 'bg-red-50 text-red-600 border border-red-200',          label: 'Deleted' },
  ARCHIVED:            { color: 'bg-gray-100 text-gray-500 border border-gray-200',      label: 'Archived' },
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
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Assignment tracking: metaObjectId → user
  const [assignments, setAssignments] = useState<Record<string, { id: string; fullName: string; phone: string; username: string } | null>>({});

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
        if (filterStatus !== 'all') p.set('status', filterStatus);

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
  }, [currentAfter, search, filterStatus, accountId]);

  // Fetch assignments for current page of ads
  useEffect(() => {
    if (data.length === 0 || !accountId) return;
    const ids = data.map((a) => a.id).join(',');
    fetch(`/api/v1/admin/meta-assignments?account_id=${accountId}&type=AD&object_ids=${ids}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const map: Record<string, { id: string; fullName: string; phone: string; username: string }> = {};
          for (const a of json.data) {
            map[a.metaObjectId] = a.user;
          }
          setAssignments(map);
        }
      })
      .catch(() => {});
  }, [data, accountId]);

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

  const handleStatusFilter = (val: string) => {
    setFilterStatus(val);
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
    setFilterStatus('all');
  }, [accountId]);

  const hasNext = !!paging?.hasNext;
  const hasPrev = cursorStack.length > 0;
  const totalPages = totalCount != null ? Math.ceil(totalCount / 10) : null;

  /** Toggle ad status between ACTIVE and PAUSED */
  const toggleStatus = async (ad: Ad) => {
    const newStatus = ad.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setTogglingId(ad.id);
    try {
      const res = await fetch('/api/v1/meta/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, status: newStatus, objectType: 'AD' }),
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) =>
          prev.map((a) =>
            a.id === ad.id ? { ...a, status: newStatus, effective_status: newStatus } : a,
          ),
        );
      } else {
        toast.error(`Failed: ${json.error}`);
      }
    } catch (e: any) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  const canToggle = (ad: Ad) =>
    ['ACTIVE', 'PAUSED'].includes(ad.status) &&
    !['DELETED', 'ARCHIVED'].includes(ad.effective_status);

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
          <div className="relative">
            <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-7 text-xs text-gray-700 focus:ring-2 focus:ring-red-400 focus:outline-none sm:w-auto"
            >
              <option value="all">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="CAMPAIGN_PAUSED">Campaign Off</option>
              <option value="ADSET_PAUSED">Ad Set Off</option>
              <option value="DELETED">Deleted</option>
              <option value="ARCHIVED">Archived</option>
              <option value="IN_PROCESS">In Review</option>
              <option value="WITH_ISSUES">With Issues</option>
              <option value="DISAPPROVED">Not Approved</option>
              <option value="PENDING_REVIEW">Pending Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <AdminSectionSkeleton variant="tableEmbedded" />
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
            <>
              {/* Mobile card list */}
              <div className="hidden">
                {data.map((ad) => {
                  const derived = ad.derived_status || { label: ad.effective_status?.replace(/_/g, ' ') || 'Unknown', key: ad.effective_status || 'UNKNOWN' };
                  const color = STATUS_STYLES[derived.key]?.color || 'bg-gray-100 text-gray-500';
                  const assignedUser = assignments[ad.id];
                  return (
                    <div key={ad.id} className="flex items-start gap-3 px-4 py-3">
                      {ad.creative?.thumbnail_url ? (
                        <img src={ad.creative.thumbnail_url} alt={ad.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">N/A</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{ad.name}</p>
                        {ad.creative?.title && <p className="mt-0.5 truncate text-xs font-medium text-gray-600">{ad.creative.title}</p>}
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{derived.label}</span>
                          <span className="text-xs text-gray-400">{new Date(ad.created_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        {ad.creative?.body && <p className="mt-0.5 line-clamp-2 text-xs text-gray-400">{ad.creative.body}</p>}
                        {canToggle(ad) && (
                          <div className="mt-1.5">
                            <button
                              onClick={() => toggleStatus(ad)}
                              disabled={togglingId === ad.id}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 ${
                                ad.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                              } ${togglingId === ad.id ? 'opacity-50' : ''}`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                  ad.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        )}
                        <div className="mt-1.5">
                          <AssignUserDropdown
                            metaObjectId={ad.id}
                            metaObjectName={ad.name}
                            metaObjectType="AD"
                            metaAccountId={accountId}
                            assignedUsers={assignedUser ? [assignedUser] : []}
                            onAssigned={(users) => setAssignments((prev) => ({ ...prev, [ad.id]: users[0] ?? null }))}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop table */}
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
                      <th className="px-4 py-3 font-medium">Assigned To</th>
                      <th className="px-4 py-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((ad) => {
                      const derived = ad.derived_status || { label: ad.effective_status?.replace(/_/g, ' ') || 'Unknown', key: ad.effective_status || 'UNKNOWN' };
                      const color = STATUS_STYLES[derived.key]?.color || 'bg-gray-100 text-gray-500';
                      const assignedUser = assignments[ad.id];
                      return (
                        <tr key={ad.id} className="transition-colors hover:bg-gray-50">
                          <td className="px-6 py-3">
                            {ad.creative?.thumbnail_url ? (
                              <img src={ad.creative.thumbnail_url} alt={ad.name} className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">N/A</div>
                            )}
                          </td>
                          <td className="max-w-45 truncate px-4 py-3 font-medium text-gray-900">{ad.name}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{derived.label}</span>
                          </td>
                          <td className="max-w-40 truncate px-4 py-3 text-gray-400">{ad.creative?.title || '—'}</td>
                          <td className="max-w-50 truncate px-4 py-3 text-xs text-gray-500">{ad.creative?.body || '—'}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                            {new Date(ad.created_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            <AssignUserDropdown
                              metaObjectId={ad.id}
                              metaObjectName={ad.name}
                              metaObjectType="AD"
                              metaAccountId={accountId}
                              assignedUsers={assignedUser ? [assignedUser] : []}
                              onAssigned={(users) => setAssignments((prev) => ({ ...prev, [ad.id]: users[0] ?? null }))}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {canToggle(ad) ? (
                              <button
                                onClick={() => toggleStatus(ad)}
                                disabled={togglingId === ad.id}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 ${
                                  ad.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                                } ${togglingId === ad.id ? 'opacity-50' : ''}`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                    ad.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
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
                <span className="min-w-8 rounded-lg bg-red-600 px-2 py-1 text-center text-xs font-medium text-white">{pageNum}{totalPages ? `/${totalPages}` : ''}</span>
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
