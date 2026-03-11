'use client';

import { useState, useEffect } from 'react';
import AdminShell from '../_components/AdminShell';
import { CampaignsTable, AdSetsTable, AdsTable } from './_components';
import AccountSwitcher from './_components/AccountSwitcher';

type Tab = 'campaigns' | 'adsets' | 'ads';

const TABS: { id: Tab; label: string }[] = [
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'adsets', label: 'Ad Sets' },
  { id: 'ads', label: 'Ads' },
];

export default function MetaDashboardPage() {
  const [tab, setTab] = useState<Tab>('campaigns');
  const [accountId, setAccountId] = useState('act_586481100654531');
  const [activeCounts, setActiveCounts] = useState<Record<Tab, number | null>>({
    campaigns: null,
    adsets: null,
    ads: null,
  });

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
        <div>
          <h1 className="text-xl font-bold text-gray-900">Meta Ads Manager</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage and monitor your Meta campaigns and ads
          </p>
        </div>

        {/* Account Switcher */}
        <AccountSwitcher value={accountId} onChange={setAccountId} />

        {/* Tabs — same on mobile and desktop */}
        <div>
          <div className="mb-6 flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm font-medium transition-all
                  ${
                    tab === t.id
                      ? 'bg-red-600 text-white shadow-sm shadow-red-500/20'
                      : 'text-gray-500 hover:bg-white hover:text-gray-700'
                  }`}
              >
                {t.label}
                {activeCounts[t.id] != null && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                      tab === t.id
                        ? 'bg-white/20 text-white'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {activeCounts[t.id]} active
                  </span>
                )}
              </button>
            ))}
          </div>
          {tab === 'campaigns' && <CampaignsTable accountId={accountId} />}
          {tab === 'adsets' && <AdSetsTable accountId={accountId} />}
          {tab === 'ads' && <AdsTable accountId={accountId} />}
        </div>
      </div>
    </AdminShell>
  );
}
