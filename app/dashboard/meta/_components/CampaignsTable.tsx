'use client';

import React from 'react';
import type { MetaCampaign, InsightRow } from './useMetaData';

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

function formatDate(val?: string) {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface Props {
  campaigns: MetaCampaign[];
  insights: InsightRow[];
}

export default function CampaignsTable({ campaigns, insights }: Props) {
  // Map campaign insights by campaign_id for fast lookup
  const insightsMap = new Map<string, InsightRow>();
  insights.forEach((row) => {
    if (row.campaign_id) insightsMap.set(row.campaign_id, row);
  });

  if (!campaigns.length) {
    return (
      <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6">
        <h3 className="mb-2 text-sm font-semibold text-gray-300">Campaigns</h3>
        <p className="text-sm text-gray-500">No campaigns found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/50">
      <div className="border-b border-gray-700/50 px-6 py-4">
        <h3 className="text-sm font-semibold text-gray-300">
          Campaigns{' '}
          <span className="ml-1 text-xs text-gray-500">({campaigns.length})</span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-700/50 text-xs uppercase text-gray-500">
              <th className="px-6 py-3 font-medium">Campaign</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Objective</th>
              <th className="px-4 py-3 font-medium text-right">Budget</th>
              <th className="px-4 py-3 font-medium text-right">Spend</th>
              <th className="px-4 py-3 font-medium text-right">Impr.</th>
              <th className="px-4 py-3 font-medium text-right">Clicks</th>
              <th className="px-4 py-3 font-medium text-right">CTR</th>
              <th className="px-4 py-3 font-medium">Dates</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/30">
            {campaigns.map((c) => {
              const ins = insightsMap.get(c.id);
              const statusColor =
                STATUS_COLORS[c.effective_status] || 'bg-gray-500/20 text-gray-400';
              return (
                <tr key={c.id} className="transition-colors hover:bg-gray-700/20">
                  <td className="max-w-[200px] truncate px-6 py-3 font-medium text-gray-200">
                    {c.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                      {c.effective_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {c.objective?.replace(/_/g, ' ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {c.daily_budget
                      ? `${formatBudget(c.daily_budget)}/day`
                      : c.lifetime_budget
                        ? `${formatBudget(c.lifetime_budget)} life`
                        : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {ins?.spend ? `$${parseFloat(ins.spend).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {ins?.impressions ? parseInt(ins.impressions).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {ins?.clicks ? parseInt(ins.clicks).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {ins?.ctr ? `${parseFloat(ins.ctr).toFixed(2)}%` : '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {formatDate(c.start_time)}
                    {c.stop_time ? ` → ${formatDate(c.stop_time)}` : ' → Ongoing'}
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
