'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { InsightRow } from './useMetaData';

interface Props {
  data: InsightRow[];
}

export default function SpendChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6">
        <h3 className="mb-2 text-sm font-semibold text-gray-300">Daily Spend</h3>
        <p className="text-sm text-gray-500">No daily spend data available.</p>
      </div>
    );
  }

  const chartData = data.map((row) => ({
    date: row.date_start,
    spend: parseFloat(row.spend || '0'),
    impressions: parseInt(row.impressions || '0', 10),
    clicks: parseInt(row.clicks || '0', 10),
  }));

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6">
      <h3 className="mb-4 text-sm font-semibold text-gray-300">Daily Spend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickFormatter={(v: string) => {
              const d = new Date(v);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickFormatter={(v: number) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#d1d5db' }}
            formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, 'Spend']}
            labelFormatter={(label) =>
              new Date(String(label)).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            }
          />
          <Area
            type="monotone"
            dataKey="spend"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#spendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
