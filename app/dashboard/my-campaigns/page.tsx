'use client';

import { useState, useEffect } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { CampaignsTable } from '../meta/_components';
import { Search, Filter } from 'lucide-react';

type CountTab = 'campaigns' | 'adsets' | 'ads';

export default function MyCampaignsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [activeCounts, setActiveCounts] = useState<Record<CountTab, number | null>>({
    campaigns: null,
    adsets: null,
    ads: null,
  });
  const countsLoading =
    activeCounts.campaigns === null &&
    activeCounts.adsets === null &&
    activeCounts.ads === null;

  useEffect(() => {
    setActiveCounts({ campaigns: null, adsets: null, ads: null });
    fetch('/api/v1/meta/active-counts')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setActiveCounts({
            campaigns: json.data.campaigns,
            adsets: json.data.adSets,
            ads: json.data.ads,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <AdminShell>
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-5">
          <h1 className="text-xl font-bold text-gray-900">My Campaigns</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage and monitor your campaigns and ads.
          </p>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_92px] gap-2 sm:mt-4 sm:grid-cols-[minmax(0,1fr)_110px] sm:gap-2.5">
            <div className="h-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 sm:p-3">
              <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 w-full sm:flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search campaigns..."
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-400 focus:outline-none"
                  />
                </div>

                <div className="relative w-full shrink-0 sm:w-auto">
                  <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
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

            <div className="h-full rounded-xl border border-green-200 bg-green-50 px-2 py-2 sm:px-2.5 sm:py-2.5 text-center flex flex-col justify-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700">
                Active
              </p>
              <p className="mt-1 text-lg font-bold leading-none text-green-700 sm:text-xl">
                {countsLoading ? (
                  <span className="mx-auto inline-block h-5 w-10 rounded-lg bg-green-200/90 skeleton-breathe" />
                ) : (
                  activeCounts.campaigns
                )}
              </p>
            </div>
          </div>
        </div>

        {countsLoading && <AdminSectionSkeleton variant="inline" />}

        <div>
          <CampaignsTable
            searchValue={search}
            onSearchValueChange={setSearch}
            statusFilterValue={statusFilter}
            onStatusFilterChange={setStatusFilter}
            hideControls
          />
        </div>
      </div>
    </AdminShell>
  );
}
