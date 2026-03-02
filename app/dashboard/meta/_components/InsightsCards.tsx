'use client';

import React from 'react';
import type { InsightRow } from './useMetaData';

function fmt(val: string | undefined, type: 'money' | 'number' | 'percent' = 'number') {
  if (!val) return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  switch (type) {
    case 'money':
      return `$${n.toFixed(2)}`;
    case 'percent':
      return `${n.toFixed(2)}%`;
    default:
      return n.toLocaleString('en-US');
  }
}

const METRIC_CONFIG = [
  { key: 'spend', label: 'Spend', type: 'money' as const },
  { key: 'impressions', label: 'Impressions', type: 'number' as const },
  { key: 'clicks', label: 'Clicks', type: 'number' as const },
  { key: 'ctr', label: 'CTR', type: 'percent' as const },
  { key: 'cpc', label: 'CPC', type: 'money' as const },
  { key: 'cpm', label: 'CPM', type: 'money' as const },
  { key: 'reach', label: 'Reach', type: 'number' as const },
  { key: 'frequency', label: 'Frequency', type: 'number' as const },
];

interface Props {
  insights: InsightRow[];
}

export default function InsightsCards({ insights }: Props) {
  const row = insights?.[0];

  if (!row) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-6">
        <p className="text-sm text-gray-400">No insight data available for this period.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {METRIC_CONFIG.map((m) => {
        const value = (row as any)[m.key];
        return (
          <div
            key={m.key}
            className="rounded-xl border border-gray-100 bg-white p-4 
                       transition-all hover:border-red-400/40"
          >
            <p className="text-xs font-bold text-gray-700 mb-1">{m.label}</p>
            <p className="text-xl font-bold text-gray-900">{fmt(value, m.type)}</p>
          </div>
        );
      })}
    </div>
  );
}
