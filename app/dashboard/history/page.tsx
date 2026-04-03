'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { Activity, RefreshCw, Search } from 'lucide-react';

type HistoryUser = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
};

type HistoryItem = {
  id: string;
  userId: string | null;
  eventType: string;
  action: string;
  path: string | null;
  method: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: HistoryUser | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

function getHistoryDetails(item: HistoryItem): string {
  const metadata = item.metadata;
  if (!metadata) return '-';

  const moduleName = typeof metadata.module === 'string' ? metadata.module : null;
  const actorAdmin = typeof metadata.actorAdminUsername === 'string'
    ? metadata.actorAdminUsername
    : (typeof metadata.actorUsername === 'string' ? metadata.actorUsername : item.user?.username || null);
  const actorFullName = typeof metadata.actorFullName === 'string' ? metadata.actorFullName : null;
  const clientUsername = typeof metadata.clientUsername === 'string' ? metadata.clientUsername : null;
  const clientFullName = typeof metadata.clientFullName === 'string' ? metadata.clientFullName : null;
  const targetUserUsername = typeof metadata.targetUserUsername === 'string' ? metadata.targetUserUsername : null;
  const targetUserFullName = typeof metadata.targetUserFullName === 'string' ? metadata.targetUserFullName : null;
  const targetUserId = typeof metadata.targetUserId === 'string' ? metadata.targetUserId : null;
  const metaObjectType = typeof metadata.metaObjectType === 'string' ? metadata.metaObjectType : null;
  const metaObjectId = typeof metadata.metaObjectId === 'string' ? metadata.metaObjectId : null;
  const targetObjectType = typeof metadata.targetObjectType === 'string' ? metadata.targetObjectType : null;
  const targetObjectId = typeof metadata.targetObjectId === 'string' ? metadata.targetObjectId : null;
  const nextStatus = typeof metadata.nextStatus === 'string' ? metadata.nextStatus : null;
  const notesRaw = metadata.changeNotes;
  const notes = Array.isArray(notesRaw)
    ? notesRaw.filter((n): n is string => typeof n === 'string' && n.length > 0)
    : [];

  const actorLabel = actorFullName ? `${actorFullName}${actorAdmin ? ` (${actorAdmin})` : ''}` : (actorAdmin || 'Unknown user');
  const clientLabel = clientFullName ? `${clientFullName}${clientUsername ? ` (${clientUsername})` : ''}` : clientUsername;
  const targetUserLabel = targetUserFullName
    ? `${targetUserFullName}${targetUserUsername ? ` (${targetUserUsername})` : ''}`
    : (targetUserUsername || (targetUserId ? `User ${targetUserId}` : null));

  if (moduleName === 'meta-status' && targetObjectType && targetObjectId && nextStatus) {
    const humanStatus = nextStatus === 'ACTIVE' ? 'ON' : nextStatus === 'PAUSED' ? 'OFF' : nextStatus;
    return `${actorLabel} changed ${targetObjectType} (${targetObjectId}) to ${humanStatus}`;
  }

  if (clientLabel && notes.length > 0) {
    return `${actorLabel} -> ${clientLabel}: ${notes.join(', ')}`;
  }

  if (targetUserLabel && metaObjectType && metaObjectId) {
    return `${actorLabel} -> ${targetUserLabel}: ${metaObjectType} (${metaObjectId})`;
  }

  try {
    return JSON.stringify(metadata);
  } catch {
    return '-';
  }
}

const EVENT_TYPE_OPTIONS = ['ALL', 'PAGE_VISIT', 'API_REQUEST', 'CUSTOM_ACTION'];

export default function DashboardHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [eventType, setEventType] = useState('ALL');

  const loadHistory = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });
      if (query.trim()) params.set('search', query.trim());
      if (eventType !== 'ALL') params.set('eventType', eventType);

      const res = await fetch(`/api/v1/admin/history?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load history');
      }
      setItems(json.data as HistoryItem[]);
      setPagination(json.pagination as Pagination);
    } catch {
      setItems([]);
      setPagination((prev) => ({ ...prev, total: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [eventType, pagination.limit, query]);

  useEffect(() => {
    void loadHistory(1);
  }, [loadHistory]);

  const hasRows = useMemo(() => items.length > 0, [items]);

  return (
    <AdminShell>
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-500" />
              <h1 className="text-lg font-bold text-gray-900 sm:text-xl">Activity History</h1>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-end gap-3">
              <div className="min-w-0 flex-1">
                <label htmlFor="history-search" className="mb-1 block text-xs font-medium text-gray-600">Search</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="history-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setQuery(search);
                      }
                    }}
                    placeholder="Search action, username, email"
                    className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-hidden focus:border-red-400"
                  />
                </div>
              </div>

              <button
                onClick={() => void loadHistory(pagination.page)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                type="button"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>

            <div className="flex items-end gap-3">
              <div className="min-w-0 flex-1">
                <label htmlFor="eventType" className="mb-1 block text-xs font-medium text-gray-600">Event Type</label>
                <select
                  id="eventType"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-hidden focus:border-red-400"
                >
                  {EVENT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setQuery(search)}
                className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {/* Mobile cards */}
          <div className="space-y-3 p-3 md:hidden">
            {loading && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                Loading history...
              </div>
            )}

            {!loading && !hasRows && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                No history found.
              </div>
            )}

            {!loading && hasRows && items.map((item) => (
              <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{item.user?.username || 'Unknown'}</p>
                    <p className="text-[11px] text-gray-500 break-all">{item.user?.email || '-'}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                    {item.eventType}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-700">
                  <p><span className="font-medium text-gray-500">Time:</span> {fmtDateTime(item.createdAt)}</p>
                  <p><span className="font-medium text-gray-500">Action:</span> {item.action}</p>
                  <p><span className="font-medium text-gray-500">Details:</span> {getHistoryDetails(item)}</p>
                  <p className="break-all"><span className="font-medium text-gray-500">Path:</span> {item.path || '-'}</p>
                  <p><span className="font-medium text-gray-500">IP:</span> {item.ipAddress || '-'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Path</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">Loading history...</td>
                  </tr>
                )}

                {!loading && !hasRows && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No history found.</td>
                  </tr>
                )}

                {!loading && hasRows && items.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{fmtDateTime(item.createdAt)}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      <div className="font-medium text-gray-900">{item.user?.username || 'Unknown'}</div>
                      <div className="text-gray-500">{item.user?.email || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.eventType}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{item.action}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{getHistoryDetails(item)}</td>
                    <td className="px-4 py-3 text-xs text-gray-700 break-all">{item.path || '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{item.ipAddress || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-100 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="text-gray-500">
              Total: <span className="font-semibold text-gray-900">{pagination.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1 || loading}
                onClick={() => void loadHistory(Math.max(1, pagination.page - 1))}
                className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-gray-600">{pagination.page} / {pagination.totalPages}</span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages || loading}
                onClick={() => void loadHistory(Math.min(pagination.totalPages, pagination.page + 1))}
                className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
