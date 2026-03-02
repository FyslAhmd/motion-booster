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

// Sample data shown when no real data is connected
const SAMPLE_DATA = [
  { date: '2026-02-01', spend: 245.5, impressions: 18200, clicks: 312 },
  { date: '2026-02-02', spend: 278.0, impressions: 21500, clicks: 389 },
  { date: '2026-02-03', spend: 310.2, impressions: 24800, clicks: 421 },
  { date: '2026-02-04', spend: 295.8, impressions: 22100, clicks: 398 },
  { date: '2026-02-05', spend: 330.1, impressions: 27300, clicks: 465 },
  { date: '2026-02-06', spend: 355.4, impressions: 29600, clicks: 512 },
  { date: '2026-02-07', spend: 320.9, impressions: 25400, clicks: 447 },
  { date: '2026-02-08', spend: 289.3, impressions: 23100, clicks: 401 },
  { date: '2026-02-09', spend: 265.7, impressions: 20800, clicks: 367 },
  { date: '2026-02-10', spend: 312.6, impressions: 25200, clicks: 438 },
  { date: '2026-02-11', spend: 341.2, impressions: 27900, clicks: 489 },
  { date: '2026-02-12', spend: 367.8, impressions: 31200, clicks: 534 },
  { date: '2026-02-13', spend: 345.0, impressions: 28500, clicks: 501 },
  { date: '2026-02-14', spend: 298.4, impressions: 24100, clicks: 415 },
  { date: '2026-02-15', spend: 275.1, impressions: 21700, clicks: 382 },
  { date: '2026-02-16', spend: 301.9, impressions: 24500, clicks: 429 },
  { date: '2026-02-17', spend: 328.5, impressions: 26800, clicks: 471 },
  { date: '2026-02-18', spend: 353.7, impressions: 29100, clicks: 509 },
  { date: '2026-02-19', spend: 379.2, impressions: 32400, clicks: 556 },
  { date: '2026-02-20', spend: 362.6, impressions: 30700, clicks: 527 },
  { date: '2026-02-21', spend: 334.1, impressions: 27500, clicks: 484 },
  { date: '2026-02-22', spend: 308.3, impressions: 25000, clicks: 442 },
  { date: '2026-02-23', spend: 282.9, impressions: 22600, clicks: 396 },
  { date: '2026-02-24', spend: 315.7, impressions: 25900, clicks: 453 },
  { date: '2026-02-25', spend: 342.4, impressions: 28200, clicks: 496 },
  { date: '2026-02-26', spend: 368.9, impressions: 31500, clicks: 541 },
  { date: '2026-02-27', spend: 391.3, impressions: 33800, clicks: 578 },
  { date: '2026-02-28', spend: 374.8, impressions: 32100, clicks: 552 },
  { date: '2026-03-01', spend: 348.2, impressions: 29400, clicks: 515 },
  { date: '2026-03-02', spend: 322.6, impressions: 26700, clicks: 469 },
];

interface ChartRow {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as ChartRow;
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg min-w-[160px]">
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
            Impressions
          </span>
          <span className="text-xs font-semibold text-gray-700">{d.impressions.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
            Clicks
          </span>
          <span className="text-xs font-semibold text-gray-700">{d.clicks.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default function SpendChart({ data }: Props) {
  const [activeMetric, setActiveMetric] = useState<'spend' | 'impressions' | 'clicks'>('spend');

  const isSample = data.length === 0;

  const chartData: ChartRow[] = isSample
    ? SAMPLE_DATA
    : data.map((row) => ({
        date: row.date_start,
        spend: parseFloat(row.spend || '0'),
        impressions: parseInt(row.impressions || '0', 10),
        clicks: parseInt(row.clicks || '0', 10),
      }));

  const total = chartData.reduce((s, r) => s + r[activeMetric], 0);
  const avg = total / chartData.length;
  const last = chartData[chartData.length - 1]?.[activeMetric] ?? 0;
  const prev = chartData[chartData.length - 2]?.[activeMetric] ?? 0;
  const trendUp = last >= prev;
  const trendPct = prev > 0 ? (((last - prev) / prev) * 100).toFixed(1) : '0';

  const metricConfig = {
    spend: { label: 'Spend', color: '#ef4444', format: (v: number) => `$${v.toFixed(2)}`, totalFmt: (v: number) => `$${v.toFixed(0)}`, gradient: 'spendGrad' },
    impressions: { label: 'Impressions', color: '#3b82f6', format: (v: number) => v.toLocaleString(), totalFmt: (v: number) => v.toLocaleString(), gradient: 'impressGrad' },
    clicks: { label: 'Clicks', color: '#f59e0b', format: (v: number) => v.toLocaleString(), totalFmt: (v: number) => v.toLocaleString(), gradient: 'clicksGrad' },
  };
  const cfg = metricConfig[activeMetric];

  return (
    <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Ad Performance</h3>
              <p className="text-xs text-gray-400">
                {isSample ? 'Sample data preview' : `${chartData.length} days`}
              </p>
            </div>
          </div>

          {/* Metric tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-gray-50 p-1 border border-gray-100">
            {(['spend', 'impressions', 'clicks'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveMetric(m)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
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
            <p className="text-sm font-bold text-gray-900 mt-0.5">{cfg.totalFmt(total)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2.5">
            <p className="text-xs text-gray-400">Daily Avg</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{cfg.format(avg)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 px-3 py-2.5">
            <p className="text-xs text-gray-400">vs Yesterday</p>
            <p className={`text-sm font-bold mt-0.5 flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
              {trendUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {trendPct}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 py-4">
        {isSample && (
          <div className="mx-3 mb-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 flex items-center gap-2">
            <span className="text-xs text-amber-600 font-medium">Sample preview — connect Meta Ads to see live data</span>
          </div>
        )}
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="impressGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.18} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
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
      </div>
    </div>
  );
}
