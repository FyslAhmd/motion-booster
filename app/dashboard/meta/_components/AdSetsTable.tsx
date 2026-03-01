'use client';

import React, { useState } from 'react';
import type { MetaAdSet, MetaCampaign } from './useMetaData';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-500/20 text-green-400',
  PAUSED: 'bg-yellow-500/20 text-yellow-400',
  DELETED: 'bg-red-500/20 text-red-400',
  ARCHIVED: 'bg-gray-500/20 text-gray-400',
};

function formatBudget(val?: string) {
  if (!val) return '—';
  const n = parseInt(val, 10) / 100;
  return `$${n.toFixed(2)}`;
}

function summarizeTargeting(targeting: any): string {
  if (!targeting) return '—';
  const parts: string[] = [];

  if (targeting.age_min || targeting.age_max) {
    parts.push(`Age ${targeting.age_min || '?'}–${targeting.age_max || '?'}`);
  }
  if (targeting.genders?.length) {
    const g = targeting.genders.map((v: number) =>
      v === 1 ? 'M' : v === 2 ? 'F' : 'All',
    );
    parts.push(g.join(', '));
  }
  if (targeting.geo_locations?.countries?.length) {
    parts.push(targeting.geo_locations.countries.join(', '));
  }
  if (targeting.interests?.length) {
    parts.push(`${targeting.interests.length} interest(s)`);
  }

  return parts.length ? parts.join(' · ') : '—';
}

interface Props {
  adsets: MetaAdSet[];
  campaigns: MetaCampaign[];
}

export default function AdSetsTable({ adsets, campaigns }: Props) {
  const [filterCampaign, setFilterCampaign] = useState<string>('all');

  const filtered =
    filterCampaign === 'all'
      ? adsets
      : adsets.filter((a) => a.campaign_id === filterCampaign);

  if (!adsets.length) {
    return (
      <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6">
        <h3 className="mb-2 text-sm font-semibold text-gray-300">Ad Sets</h3>
        <p className="text-sm text-gray-500">No ad sets found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/50">
      <div className="flex items-center justify-between border-b border-gray-700/50 px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-300">
          Ad Sets{' '}
          <span className="ml-1 text-xs text-gray-500">({filtered.length})</span>
        </h3>
        {campaigns.length > 0 && (
          <select
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 
                       focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All campaigns</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-700/50 text-xs uppercase text-gray-500">
              <th className="px-6 py-3 font-medium">Ad Set</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Optimization</th>
              <th className="px-4 py-3 font-medium text-right">Budget</th>
              <th className="px-4 py-3 font-medium">Targeting</th>
              <th className="px-4 py-3 font-medium">Schedule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/30">
            {filtered.map((a) => {
              const statusColor =
                STATUS_COLORS[a.effective_status] || 'bg-gray-500/20 text-gray-400';
              return (
                <tr key={a.id} className="transition-colors hover:bg-gray-700/20">
                  <td className="max-w-[200px] truncate px-6 py-3 font-medium text-gray-200">
                    {a.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                      {a.effective_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {a.optimization_goal?.replace(/_/g, ' ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {a.daily_budget
                      ? `${formatBudget(a.daily_budget)}/day`
                      : a.lifetime_budget
                        ? `${formatBudget(a.lifetime_budget)} life`
                        : '—'}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-xs text-gray-400">
                    {summarizeTargeting(a.targeting)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {a.start_time
                      ? new Date(a.start_time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : '—'}
                    {a.end_time
                      ? ` → ${new Date(a.end_time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}`
                      : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
