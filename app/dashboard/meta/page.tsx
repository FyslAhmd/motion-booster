'use client';

import { useState } from 'react';
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
  const [accountId, setAccountId] = useState('');

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Meta Ads Manager</h1>
            <p className="mt-0.5 text-sm text-gray-400">
              Manage and monitor your Meta campaigns, ad sets, and ads
            </p>
          </div>
          <AccountSwitcher value={accountId} onChange={setAccountId} />
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
        {accountId && tab === 'campaigns' && <CampaignsTable accountId={accountId} />}
        {accountId && tab === 'adsets' && <AdSetsTable accountId={accountId} />}
        {accountId && tab === 'ads' && <AdsTable accountId={accountId} />}
        {!accountId && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-500">
            Loading account...
          </div>
        )}
      </div>
    </AdminShell>
  );
}
