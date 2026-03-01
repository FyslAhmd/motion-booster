'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { InsightRow } from './useMetaData';

const COLORS = ['#a855f7', '#6366f1', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#eab308', '#ef4444'];

interface Props {
  ageGender: InsightRow[];
  country: InsightRow[];
}

export default function DemographicsCharts({ ageGender, country }: Props) {
  // ── Age-Gender bar chart data ──
  const ageData = ageGender.reduce<Record<string, { age: string; male: number; female: number; unknown: number }>>(
    (acc, row) => {
      const age = row.age || 'Unknown';
      if (!acc[age]) acc[age] = { age, male: 0, female: 0, unknown: 0 };
      const spend = parseFloat(row.spend || '0');
      const gender = row.gender?.toLowerCase() || 'unknown';
      if (gender === 'male') acc[age].male += spend;
      else if (gender === 'female') acc[age].female += spend;
      else acc[age].unknown += spend;
      return acc;
    },
    {},
  );
  const ageBars = Object.values(ageData).sort((a, b) => a.age.localeCompare(b.age));

  // ── Country pie chart data ──
  const countryMap = new Map<string, number>();
  country.forEach((row) => {
    const c = row.country || 'Unknown';
    countryMap.set(c, (countryMap.get(c) || 0) + parseFloat(row.spend || '0'));
  });
  const countryPie = Array.from(countryMap.entries())
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const hasAge = ageBars.length > 0;
  const hasCountry = countryPie.length > 0;

  if (!hasAge && !hasCountry) {
    return (
      <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6">
        <h3 className="mb-2 text-sm font-semibold text-gray-300">Demographics</h3>
        <p className="text-sm text-gray-500">No demographic data available.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Age × Gender Bar Chart */}
      {hasAge && (
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-300">Spend by Age &amp; Gender</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ageBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="age" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value) => `$${Number(value ?? 0).toFixed(2)}`}
              />
              <Bar dataKey="male" name="Male" fill="#6366f1" radius={[2, 2, 0, 0]} />
              <Bar dataKey="female" name="Female" fill="#ec4899" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Country Pie Chart */}
      {hasCountry && (
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-300">Spend by Country</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={countryPie}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {countryPie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value) => `$${Number(value ?? 0).toFixed(2)}`}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#9ca3af' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
