'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { InsightRow } from './useMetaData';

interface Props {
  data: InsightRow[];
}

interface ChartRow {
  date: string;
  spend: number;
  reach: number;
  impressions: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as ChartRow;
  return (
    <div className="rounded-xl border border-gray-100 bg-white  shadow-lg min-w-40">
      <p className="text-xs font-semibold text-gray-700 mb-2">
        {new Date(String(label)).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric',
        })}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
            Spend
          </span>
          <span className="text-xs font-bold text-gray-900">${d.spend.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
            Reach
          </span>
          <span className="text-xs font-semibold text-gray-700">{d.reach.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400" />
            Impressions
          </span>
          <span className="text-xs font-semibold text-gray-700">{d.impressions.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default function SpendChart({ data }: Props) {
  const [activeMetric, setActiveMetric] = useState<'spend' | 'reach' | 'impressions'>('spend');

  const chartData: ChartRow[] = data.map((row) => ({
    date: row.date_start,
    spend: parseFloat(row.spend || '0'),
    reach: parseInt(row.reach || '0', 10),
    impressions: parseInt(row.impressions || '0', 10),
  }));
  const noData = chartData.length === 0;

  const total = chartData.reduce((s, r) => s + r[activeMetric], 0);
  const avg = chartData.length > 0 ? total / chartData.length : 0;
  const last = chartData[chartData.length - 1]?.[activeMetric] ?? 0;
  const prev = chartData[chartData.length - 2]?.[activeMetric] ?? 0;
  const trendUp = last >= prev;
  const trendPct = prev > 0 ? (((last - prev) / prev) * 100).toFixed(1) : '0';

  const metricConfig = {
    spend: { label: 'Spend', color: '#ef4444', format: (v: number) => `$${v.toFixed(2)}`, totalFmt: (v: number) => `$${v.toFixed(0)}`, gradient: 'spendGrad' },
    reach: { label: 'Reach', color: '#3b82f6', format: (v: number) => v.toLocaleString(), totalFmt: (v: number) => v.toLocaleString(), gradient: 'reachGrad' },
    impressions: { label: 'Impressions', color: '#6366f1', format: (v: number) => v.toLocaleString(), totalFmt: (v: number) => v.toLocaleString(), gradient: 'impressGrad' },
  };
  const cfg = metricConfig[activeMetric];

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-2 md:px-5 py-5 border-b border-gray-50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Ad Performance</h3>
              <p className="text-xs text-gray-400">
                {noData ? 'No data available for selected period' : `${chartData.length} days`}
              </p>
            </div>
          </div>

          {/* Metric tabs */}
          <div className="flex w-full items-center rounded-lg bg-gray-50 p-1 border border-gray-100 sm:w-auto">
            {(['spend', 'reach', 'impressions'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
                className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize sm:flex-initial ${
                  activeMetric === m
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-gray-50 px-3 py-2.5">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{noData ? '—' : cfg.totalFmt(total)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2.5">
            <p className="text-xs text-gray-400">Daily Avg</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{noData ? '—' : cfg.format(avg)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2.5">
            <p className="text-xs text-gray-400">Yesterday</p>
            {noData ? (
              <p className="text-sm font-bold text-gray-900 mt-0.5">—</p>
            ) : (
              <p className={`text-sm font-bold mt-0.5 flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
                {trendUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {trendPct}%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 py-4">
        {noData ? (
          <div className="mx-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-8 text-center">
            <span className="text-xs text-gray-500 font-medium">No performance data returned from API for this date range.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="impressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
              <ReferenceLine y={avg} stroke={cfg.color} strokeDasharray="5 5" strokeOpacity={0.35} strokeWidth={1.5} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                interval="preserveStartEnd"
                tickFormatter={(v: string) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                width={activeMetric === 'spend' ? 45 : 55}
                tickFormatter={(v: number) =>
                  activeMetric === 'spend'
                    ? `$${v}`
                    : v >= 1000
                    ? `${(v / 1000).toFixed(0)}k`
                    : String(v)
                }
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: cfg.color, strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.5 }} />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={cfg.color}
                strokeWidth={2}
                fill={`url(#${cfg.gradient})`}
                dot={false}
                activeDot={{ r: 5, fill: cfg.color, strokeWidth: 2.5, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
