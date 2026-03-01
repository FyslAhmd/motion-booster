'use client';

import { useState } from 'react';
import AdminShell from '../_components/AdminShell';
import {
  useMetaData,
  DatePresetSelector,
  AccountOverview,
  InsightsCards,
  SpendChart,
  CampaignsTable,
  AdSetsTable,
  AdsTable,
  DemographicsCharts,
} from './_components';
import { RefreshCw, AlertTriangle } from 'lucide-react';

type Tab = 'overview' | 'campaigns' | 'adsets' | 'ads' | 'demographics';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'adsets', label: 'Ad Sets' },
  { id: 'ads', label: 'Ads' },
  { id: 'demographics', label: 'Demographics' },
];

export default function MetaDashboardPage() {
  const meta = useMetaData();
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Meta Ads Dashboard</h1>
            <p className="mt-0.5 text-sm text-gray-400">
              Monitor your Meta advertising performance in real time
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DatePresetSelector value={meta.datePreset} onChange={meta.setDatePreset} />
            <button
              onClick={meta.refresh}
              disabled={meta.loading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 
                         text-sm text-gray-300 transition-colors hover:bg-gray-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${meta.loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Error Banner ── */}
        {meta.error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-300">Failed to load some data</p>
              <p className="mt-0.5 text-xs text-red-400/80">{meta.error}</p>
            </div>
          </div>
        )}

        {/* ── Loading State ── */}
        {meta.loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              <p className="text-sm text-gray-400">Loading Meta data...</p>
            </div>
          </div>
        )}

        {/* ── Content ── */}
        {!meta.loading && (
          <>
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
            {tab === 'overview' && (
              <div className="space-y-6">
                <AccountOverview account={meta.account} />
                <InsightsCards insights={meta.accountInsights} />
                <SpendChart data={meta.dailySpend} />
              </div>
            )}

            {tab === 'campaigns' && (
              <CampaignsTable
                campaigns={meta.campaigns}
                insights={meta.campaignInsights}
              />
            )}

            {tab === 'adsets' && (
              <AdSetsTable adsets={meta.adsets} campaigns={meta.campaigns} />
            )}

            {tab === 'ads' && <AdsTable ads={meta.ads} />}

            {tab === 'demographics' && (
              <DemographicsCharts
                ageGender={meta.demographics.ageGender}
                country={meta.demographics.country}
              />
            )}
          </>
        )}
      </div>
    </AdminShell>
  );
}
