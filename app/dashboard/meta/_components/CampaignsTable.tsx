'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import AssignUserDropdown from './AssignUserDropdown';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  effective_status: string;
  configured_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  spend_cap?: string;
  start_time?: string;
  stop_time?: string;
  created_time: string;
  updated_time?: string;
  ads?: { data: Array<{ creative?: { thumbnail_url?: string } }> };
  /** Computed by backend via deriveDeliveryStatus — always present in API response */
  derived_status?: { label: string; key: string };
}

interface CursorPaging {
  cursors?: { before?: string; after?: string };
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:               'bg-green-50 text-green-700 border border-green-200',
  SCHEDULED:            'bg-blue-50 text-blue-700 border border-blue-200',
  IN_REVIEW:            'bg-yellow-50 text-yellow-700 border border-yellow-200',
  COMPLETED:            'bg-indigo-50 text-indigo-600 border border-indigo-200',
  RECENTLY_COMPLETED:   'bg-indigo-50 text-indigo-600 border border-indigo-200',
  PAUSED:               'bg-amber-50 text-amber-700 border border-amber-200',
  NOT_DELIVERING:       'bg-orange-50 text-orange-600 border border-orange-200',
  WITH_ISSUES:          'bg-orange-50 text-orange-600 border border-orange-200',
  NOT_APPROVED:         'bg-red-50 text-red-600 border border-red-200',
  DELETED:              'bg-red-50 text-red-600 border border-red-200',
  ARCHIVED:             'bg-gray-100 text-gray-500 border border-gray-200',
  ERROR:                'bg-red-50 text-red-500 border border-red-200',
  UNKNOWN:              'bg-gray-100 text-gray-500',
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
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [cursorStack, setCursorStack] = useState<string[]>([]);  // stack of "after" cursors for prev navigation
  const [currentAfter, setCurrentAfter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Assignment tracking: metaObjectId → { id, fullName, phone, username }
  const [assignments, setAssignments] = useState<Record<string, { id: string; fullName: string; phone: string; username: string } | null>>({});

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
        if (filterStatus !== 'all') p.set('status', filterStatus);

        const res = await fetch(`/api/v1/meta/campaigns?${p}`, { signal: controller.signal });
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

  // Fetch assignments for current page of campaigns
  useEffect(() => {
    if (data.length === 0 || !accountId) return;
    const ids = data.map((c) => c.id).join(',');
    fetch(`/api/v1/admin/meta-assignments?account_id=${accountId}&type=CAMPAIGN&object_ids=${ids}`)
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
    setFilterStatus('ACTIVE');
  }, [accountId]);

  const hasNext = !!paging?.hasNext;
  const hasPrev = cursorStack.length > 0;
  const totalPages = totalCount != null ? Math.ceil(totalCount / 10) : null;

  /** Toggle campaign status between ACTIVE and PAUSED */
  const toggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setTogglingId(campaign.id);
    try {
      const res = await fetch('/api/v1/meta/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaign.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        // Optimistically update the local row
        setData((prev) =>
          prev.map((c) =>
            c.id === campaign.id
              ? { ...c, status: newStatus, effective_status: newStatus, configured_status: newStatus }
              : c,
          ),
        );
      } else {
        toast.error(`Failed: ${json.error}`);
      }
    } catch (e: any) {
      toast.error(`Error: ${e.message}`);
      setTogglingId(null);
    }
  };

  /** Can this campaign be toggled? */
  const canToggle = (c: Campaign) =>
    ['ACTIVE', 'PAUSED'].includes(c.status) &&
    !['DELETED', 'ARCHIVED'].includes(c.effective_status);

  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      {/* Controls */}
      <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Campaigns {pageNum > 1 && <span className="ml-1 text-xs text-gray-500">Page {pageNum}{totalPages ? `/${totalPages}` : ''}</span>}
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
              <option value="COMPLETED">Completed</option>
              <option value="RECENTLY_COMPLETED">Recently Completed</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="NOT_DELIVERING">Not Delivering</option>
              <option value="DELETED">Deleted</option>
              <option value="ARCHIVED">Archived</option>
              <option value="IN_PROCESS">In Review</option>
              <option value="WITH_ISSUES">With Issues</option>
            </select>
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
            <>
              {/* Mobile card list */}
              <div className="hidden">
                {data.map((c) => {
                  const derived = c.derived_status || { label: c.effective_status?.replace(/_/g, ' ') || 'Unknown', key: c.effective_status || 'UNKNOWN' };
                  const color = STATUS_STYLES[derived.key] || STATUS_STYLES.UNKNOWN;
                  const thumb = c.ads?.data?.[0]?.creative?.thumbnail_url;
                  return (
                    <div key={c.id} className="flex items-start gap-3 px-4 py-3">
                      {thumb ? (
                        <img src={thumb} alt={c.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">N/A</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{c.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{derived.label}</span>
                          <span className="text-xs text-gray-500">
                            {c.daily_budget ? `${fmtBudget(c.daily_budget)}/day` : c.lifetime_budget ? `${fmtBudget(c.lifetime_budget)} lifetime` : '—'}
                          </span>
                        </div>
                        {/* Mobile toggle */}
                        {canToggle(c) && (
                          <div className="mt-1.5">
                            <button
                              onClick={() => toggleStatus(c)}
                              disabled={togglingId === c.id}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 ${
                                c.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                              } ${togglingId === c.id ? 'opacity-50' : ''}`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                  c.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        )}
                        {/* Mobile assign button */}
                        {accountId && (
                          <div className="mt-1.5">
                            <AssignUserDropdown
                              metaObjectId={c.id}
                              metaObjectType="CAMPAIGN"
                              metaAccountId={accountId}
                              assignedUser={assignments[c.id] || null}
                              onAssigned={(user) => setAssignments((prev) => ({ ...prev, [c.id]: user }))}
                            />
                          </div>
                        )}
                        <p className="mt-0.5 text-xs text-gray-400">{c.objective?.replace(/_/g, ' ') || '—'} · {fmtDate(c.created_time)}</p>
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
                      <th className="px-4 py-3 font-medium">Campaign</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Objective</th>
                      <th className="px-4 py-3 font-medium text-right">Budget</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="px-4 py-3 font-medium">Date Range</th>
                      <th className="px-4 py-3 font-medium">Assigned To</th>
                      <th className="px-4 py-3 font-medium text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((c) => {
                      const derived = c.derived_status || { label: c.effective_status?.replace(/_/g, ' ') || 'Unknown', key: c.effective_status || 'UNKNOWN' };
                      const color = STATUS_STYLES[derived.key] || STATUS_STYLES.UNKNOWN;
                      return (
                        <tr key={c.id} className="transition-colors hover:bg-gray-50">
                          <td className="px-6 py-3">
                            {c.ads?.data?.[0]?.creative?.thumbnail_url ? (
                              <img src={c.ads.data[0].creative.thumbnail_url} alt={c.name} className="h-10 w-10 rounded-lg object-cover" />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">N/A</div>
                            )}
                          </td>
                          <td className="max-w-50 truncate px-4 py-3 font-medium text-gray-900">{c.name}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{derived.label}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-400">{c.objective?.replace(/_/g, ' ') || '—'}</td>
                          <td className="px-4 py-3 text-right text-gray-700">
                            {c.daily_budget ? `${fmtBudget(c.daily_budget)}/day` : c.lifetime_budget ? `${fmtBudget(c.lifetime_budget)} life` : '—'}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{fmtDate(c.created_time)}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                            {fmtDate(c.start_time)}{c.stop_time ? ` → ${fmtDate(c.stop_time)}` : ' → Ongoing'}
                          </td>
                          <td className="px-4 py-3">
                            {accountId && (
                              <AssignUserDropdown
                                metaObjectId={c.id}
                                metaObjectType="CAMPAIGN"
                                metaAccountId={accountId}
                                assignedUser={assignments[c.id] || null}
                                onAssigned={(user) => setAssignments((prev) => ({ ...prev, [c.id]: user }))}
                              />
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {canToggle(c) ? (
                              <button
                                onClick={() => toggleStatus(c)}
                                disabled={togglingId === c.id}
                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 ${
                                  c.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                                } ${togglingId === c.id ? 'opacity-50' : ''}`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                    c.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-1'
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