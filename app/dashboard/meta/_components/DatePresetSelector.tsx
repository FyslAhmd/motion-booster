'use client';

import React, { useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';

const PRESETS = [
  { value: 'today',       label: 'Today' },
  { value: 'yesterday',   label: 'Yesterday' },
  { value: 'last_7d',     label: 'Last 7 days' },
  { value: 'last_14d',    label: 'Last 14 days' },
  { value: 'last_30d',    label: 'Last 30 days' },
  { value: 'last_90d',    label: 'Last 90 days' },
  { value: 'this_month',  label: 'This month' },
  { value: 'last_month',  label: 'Last month' },
  { value: 'custom',      label: 'Custom range' },
] as const;

interface Props {
  value: string;
  onChange: (v: string) => void;
  customSince?: string;
  customUntil?: string;
  onCustomChange?: (since: string, until: string) => void;
}

export default function DatePresetSelector({ value, onChange, customSince = '', customUntil = '', onCustomChange }: Props) {
  const selectedLabel = PRESETS.find(p => p.value === value)?.label ?? 'Last 30 days';

  const handlePresetChange = (v: string) => {
    onChange(v);
  };

  const handleSince = (since: string) => {
    onCustomChange?.(since, customUntil);
    if (since && customUntil) onChange('custom');
  };

  const handleUntil = (until: string) => {
    onCustomChange?.(customSince, until);
    if (customSince && until) onChange('custom');
  };

  return (
    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
      {/* Preset dropdown */}
      <div className="relative w-full">
        <select
          value={value}
          onChange={(e) => handlePresetChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-gray-200 bg-white pl-8 pr-8 py-2 text-sm text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-red-400 cursor-pointer"
        >
          {PRESETS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
      </div>

      {/* Custom date inputs — stacked below preset on mobile */}
      {value === 'custom' && (
        <div className="flex items-center gap-1.5 w-full">
          <input
            type="date"
            value={customSince}
            max={customUntil || undefined}
            onChange={(e) => handleSince(e.target.value)}
            className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <span className="text-xs text-gray-400 font-medium shrink-0">to</span>
          <input
            type="date"
            value={customUntil}
            min={customSince || undefined}
            onChange={(e) => handleUntil(e.target.value)}
            className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
      )}
    </div>
  );
}
