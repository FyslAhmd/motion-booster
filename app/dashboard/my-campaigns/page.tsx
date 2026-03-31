'use client';

import { useState, useEffect } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { CampaignsTable } from '../meta/_components';
import { Search, Filter, Activity, BarChart3, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

interface CampaignLite {
  id: string;
  status?: string;
  effective_status?: string;
}

export default function MyCampaignsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [refreshTick, setRefreshTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [assignedCampaignIds, setAssignedCampaignIds] = useState<string[]>([]);
  const [campaignAccountById, setCampaignAccountById] = useState<Record<string, string>>({});
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false);
  const [activeCampaignCount, setActiveCampaignCount] = useState<number | null>(null);
  const countsLoading = activeCampaignCount === null;

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    setAssignmentsLoaded(false);
    fetch(`/api/v1/admin/meta-assignments/users/${user.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled || !json?.success) return;

        const campaigns = Array.isArray(json?.data?.campaigns) ? json.data.campaigns : [];
        const ids = campaigns
          .map((c: { metaObjectId?: string }) => c?.metaObjectId)
          .filter((id: string | undefined): id is string => typeof id === 'string' && id.length > 0);

        const accountMap: Record<string, string> = {};
        campaigns.forEach((c: { metaObjectId?: string; metaAccountId?: string }) => {
          if (c?.metaObjectId && c?.metaAccountId) {
            accountMap[c.metaObjectId] = c.metaAccountId;
          }
        });

        setAssignedCampaignIds(Array.from(new Set(ids)));
        setCampaignAccountById(accountMap);
        setAssignmentsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setAssignedCampaignIds([]);
          setCampaignAccountById({});
          setAssignmentsLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, refreshTick]);

  useEffect(() => {
    if (!assignmentsLoaded) return;

    const uniqueIds = Array.from(new Set(assignedCampaignIds.filter(Boolean)));
    if (uniqueIds.length === 0) {
      setActiveCampaignCount(0);
      return;
    }

    let cancelled = false;
    const loadActiveCount = async () => {
      setActiveCampaignCount(null);
      try {
        const chunkSize = 40;
        const allCampaigns: CampaignLite[] = [];

        for (let i = 0; i < uniqueIds.length; i += chunkSize) {
          const chunk = uniqueIds.slice(i, i + chunkSize);
          const params = new URLSearchParams({ type: 'CAMPAIGN', ids: chunk.join(',') });
          const res = await fetch(`/api/v1/meta/by-ids?${params.toString()}`);
          const json = await res.json();
          if (json?.success && Array.isArray(json.data)) {
            allCampaigns.push(...json.data);
          }
        }

        const activeCount = allCampaigns.filter(
          (c) => c?.status === 'ACTIVE' || c?.effective_status === 'ACTIVE',
        ).length;

        if (!cancelled) {
          setActiveCampaignCount(activeCount);
        }
      } catch {
        if (!cancelled) {
          setActiveCampaignCount(0);
        }
      }
    };

    loadActiveCount();
    return () => {
      cancelled = true;
    };
  }, [assignmentsLoaded, assignedCampaignIds, refreshTick]);

  useEffect(() => {
    if (refreshing && assignmentsLoaded && activeCampaignCount !== null) {
      setRefreshing(false);
    }
  }, [refreshing, assignmentsLoaded, activeCampaignCount]);

  const handleRefresh = () => {
    setRefreshing(true);
    setActiveCampaignCount(null);
    setRefreshTick((prev) => prev + 1);
  };

  return (
    <AdminShell>
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-5">
          <h1 className="text-xl font-bold text-gray-900">My Campaigns</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage and monitor your campaigns and ads.
          </p>
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-2.5 sm:mt-4 sm:p-3">
            <div className="flex w-full min-w-0 items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search campaigns..."
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </div>

              <div className="relative w-36 shrink-0 sm:w-44">
                <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-7 text-xs text-gray-700 focus:ring-2 focus:ring-red-400 focus:outline-none"
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

            <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-linear-to-b from-emerald-50 to-white px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm"
              >
                <Activity className="h-4 w-4" />
                {countsLoading ? 'Active ...' : `Active ${activeCampaignCount}`}
              </button>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                <BarChart3 className="h-4 w-4 text-slate-500" />
                Report
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                aria-label="Refresh campaigns"
                title="Refresh campaigns"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 shadow-sm transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {countsLoading && <AdminSectionSkeleton variant="inline" />}

        <div>
          <CampaignsTable
            key={`my-campaigns-${refreshTick}`}
            searchValue={search}
            onSearchValueChange={setSearch}
            statusFilterValue={statusFilter}
            onStatusFilterChange={setStatusFilter}
            hideControls
            assignedCampaignIds={assignedCampaignIds}
            campaignAccountById={campaignAccountById}
          />
        </div>
      </div>
    </AdminShell>
  );
}
