'use client';

import { useState, useEffect } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { CampaignsTable } from './_components';
import AccountSwitcher from './_components/AccountSwitcher';

type CountTab = 'campaigns' | 'adsets' | 'ads';

export default function MetaDashboardPage() {
  const [accountId, setAccountId] = useState('act_586481100654531');
  const [activeCounts, setActiveCounts] = useState<Record<CountTab, number | null>>({
    campaigns: null,
    adsets: null,
    ads: null,
  });
  const countsLoading =
    activeCounts.campaigns === null &&
    activeCounts.adsets === null &&
    activeCounts.ads === null;

  // Fetch total active counts whenever account changes
  useEffect(() => {
    setActiveCounts({ campaigns: null, adsets: null, ads: null });
    fetch(`/api/v1/meta/active-counts?account_id=${accountId}`)
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
  }, [accountId]);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <h1 className="text-xl font-bold text-gray-900">Meta Ads Manager</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage and monitor your Meta campaigns and ads.
          </p>
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_92px] sm:grid-cols-[minmax(0,1fr)_110px] gap-2.5">
            <div className="h-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 sm:p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Select Account
              </p>
              <div className="mt-1.5 max-w-xs sm:max-w-sm">
                <AccountSwitcher
                  value={accountId}
                  onChange={setAccountId}
                  compact
                />
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

        {/* Campaigns (main view) */}
        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">Campaigns</h2>
          </div>
          <CampaignsTable accountId={accountId} />
        </div>
      </div>
    </AdminShell>
  );
}
