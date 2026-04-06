'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { useConfirm } from '@/lib/admin/confirm';
import { toast } from 'sonner';
import { CheckCircle2, Search, XCircle, Filter } from 'lucide-react';

type RequestState = 'PENDING' | 'APPROVED' | 'REJECTED';
type RequestedStatus = 'ACTIVE' | 'PAUSED';

interface StatusRequestItem {
  id: string;
  metaObjectId: string;
  metaObjectType: 'CAMPAIGN' | 'ADSET' | 'AD';
  metaObjectName: string;
  currentStatus?: string | null;
  requestedStatus: RequestedStatus;
  state: RequestState;
  reason?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  requesterUser: {
    id: string;
    fullName: string;
    username: string;
    email: string;
  };
  reviewedByAdmin?: {
    id: string;
    username: string;
    fullName: string;
  } | null;
}

interface ApiResponse {
  success: boolean;
  data: StatusRequestItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MetaStatusRequestsPage() {
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<StatusRequestItem[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<'ALL' | RequestState>('PENDING');
  const [requestedStatusFilter, setRequestedStatusFilter] = useState<'ALL' | RequestedStatus>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(t);
  }, [search]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        state: stateFilter,
        requestedStatus: requestedStatusFilter,
      });
      if (debouncedSearch) params.set('search', debouncedSearch);

      const res = await fetch(`/api/v1/admin/meta-status-requests?${params.toString()}`, {
        cache: 'no-store',
        credentials: 'include',
      });
      const json = (await res.json()) as ApiResponse;

      if (!res.ok || !json?.success) {
        throw new Error('Failed to load status requests');
      }

      setRows(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
      setTotal(json.pagination?.total || 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load status requests');
      setRows([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, stateFilter, requestedStatusFilter, debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pendingCount = useMemo(
    () => rows.filter((row) => row.state === 'PENDING').length,
    [rows],
  );

  const updateDecision = useCallback(
    async (requestId: string, decision: 'APPROVE' | 'REJECT') => {
      if (updatingId) return;

      const ok = await confirm({
        title: decision === 'APPROVE' ? 'Approve activation request' : 'Reject activation request',
        message:
          decision === 'APPROVE'
            ? 'Are you sure you want to approve this activation request?'
            : 'Are you sure you want to reject this activation request?',
      });
      if (!ok) return;

      setUpdatingId(requestId);
      try {
        const res = await fetch('/api/v1/admin/meta-status-requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId, decision }),
        });

        const json = await res.json();
        if (!res.ok || !json?.success) {
          throw new Error(json?.error || 'Failed to update request');
        }

        toast.success(
          decision === 'APPROVE'
            ? 'Activation request approved successfully.'
            : 'Activation request rejected successfully.',
        );

        await loadData();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to update request');
      } finally {
        setUpdatingId(null);
      }
    },
    [confirm, updatingId, loadData],
  );

  return (
    <AdminShell>
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <h1 className="text-xl font-bold text-gray-900">Activation Requests</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review user requests to activate campaign items. Pending requests require admin approval.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">Total</p>
              <p className="mt-1 text-lg font-bold text-gray-800">{total}</p>
            </div>
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-yellow-700">Pending in page</p>
              <p className="mt-1 text-lg font-bold text-yellow-700">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_160px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by requester, campaign name, or object ID"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-800 outline-none ring-red-200 transition focus:border-red-400 focus:ring-2"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value as 'ALL' | RequestState);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm text-gray-800 outline-none ring-red-200 transition focus:border-red-400 focus:ring-2"
              >
                <option value="ALL">All states</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <select
                value={requestedStatusFilter}
                onChange={(e) => {
                  setRequestedStatusFilter(e.target.value as 'ALL' | RequestedStatus);
                  setPage(1);
                }}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none ring-red-200 transition focus:border-red-400 focus:ring-2"
              >
                <option value="ALL">All requested status</option>
                <option value="ACTIVE">Activate requests</option>
                <option value="PAUSED">Pause requests</option>
              </select>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            {loading ? (
              <AdminSectionSkeleton variant="inline" />
            ) : rows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-500">
                No status requests found for current filters.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-3 py-2">Requester</th>
                    <th className="px-3 py-2">Object</th>
                    <th className="px-3 py-2">Request</th>
                    <th className="px-3 py-2">State</th>
                    <th className="px-3 py-2">Submitted</th>
                    <th className="px-3 py-2">Reviewed</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {rows.map((row) => (
                    <tr key={row.id} className="align-top">
                      <td className="px-3 py-3">
                        <p className="font-semibold text-gray-900">{row.requesterUser.fullName || row.requesterUser.username}</p>
                        <p className="text-xs text-gray-500">{row.requesterUser.email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-gray-900">{row.metaObjectName}</p>
                        <p className="text-xs text-gray-500">{row.metaObjectType} • {row.metaObjectId}</p>
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          {row.requestedStatus}
                        </span>
                        {row.currentStatus ? (
                          <p className="mt-1 text-xs text-gray-500">Current: {row.currentStatus}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            row.state === 'PENDING'
                              ? 'bg-yellow-50 text-yellow-700'
                              : row.state === 'APPROVED'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {row.state}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600">{formatDateTime(row.createdAt)}</td>
                      <td className="px-3 py-3 text-xs text-gray-600">
                        {formatDateTime(row.reviewedAt)}
                        {row.reviewedByAdmin ? (
                          <p className="mt-1 text-[11px] text-gray-500">by {row.reviewedByAdmin.fullName || row.reviewedByAdmin.username}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        {row.state === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updateDecision(row.id, 'APPROVE')}
                              disabled={updatingId === row.id}
                              className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => updateDecision(row.id, 'REJECT')}
                              disabled={updatingId === row.id}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-right text-xs text-gray-400">Reviewed</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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
