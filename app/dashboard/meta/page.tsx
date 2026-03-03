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
  const [accountId, setAccountId] = useState('act_586481100654531');

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Meta Ads Manager</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage and monitor your Meta campaigns, ad sets, and ads
          </p>
        </div>

        {/* Account Switcher */}
        <AccountSwitcher value={accountId} onChange={setAccountId} />

        {/* Mobile: stacked sections */}
        <div className="flex flex-col gap-6 sm:hidden">
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Campaigns</p>
            <CampaignsTable accountId={accountId} />
          </section>
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Ad Sets</p>
            <AdSetsTable accountId={accountId} />
          </section>
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Ads</p>
            <AdsTable accountId={accountId} />
          </section>
        </div>

        {/* Desktop: tabs */}
        <div className="hidden sm:block">
          <div className="mb-6 flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all
                  ${
                    tab === t.id
                      ? 'bg-red-600 text-white shadow-sm shadow-red-500/20'
                      : 'text-gray-500 hover:bg-white hover:text-gray-700'
                  }`}
              >
                {t.label}
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
