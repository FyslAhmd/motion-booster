'use client';

import { useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { CampaignsTable, AdSetsTable, AdsTable } from './_components';

type Tab = 'campaigns' | 'adsets' | 'ads';

const TABS: { id: Tab; label: string }[] = [
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'adsets', label: 'Ad Sets' },
  { id: 'ads', label: 'Ads' },
];

export default function MetaDashboardPage() {
  const [tab, setTab] = useState<Tab>('campaigns');

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Meta Ads Manager</h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Manage and monitor your Meta campaigns, ad sets, and ads
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-gray-700/50 bg-gray-800/50 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all
                ${
                  tab === t.id
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'campaigns' && <CampaignsTable />}
        {tab === 'adsets' && <AdSetsTable />}
        {tab === 'ads' && <AdsTable />}
      </div>
    </AdminShell>
  );
}
