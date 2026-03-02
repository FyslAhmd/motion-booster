'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

type Preset = 'last_14d' | 'last_30d' | 'custom';

const PRESETS: { id: Preset; label: string }[] = [
  { id: 'last_14d', label: 'Last 14 Days' },
  { id: 'last_30d', label: 'Last 30 Days' },
  { id: 'custom', label: 'Custom Range' },
];

function toYMD(d: Date) {
  return d.toISOString().split('T')[0];
}

function getPresetDates(preset: Preset): { from: string; to: string } {
  const now = new Date();
  const to = toYMD(now);

  if (preset === 'last_14d') {
    return { from: toYMD(new Date(now.getTime() - 14 * 86_400_000)), to };
  }
  if (preset === 'last_30d') {
    return { from: toYMD(new Date(now.getTime() - 30 * 86_400_000)), to };
  }
  return { from: '', to: '' };
}

interface Props {
  onDateChange: (dateFrom: string, dateTo: string) => void;
}

export default function DateRangeFilter({ onDateChange }: Props) {
  const [preset, setPreset] = useState<Preset>('last_30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // Fire initial date on mount
  useEffect(() => {
    const { from, to } = getPresetDates('last_30d');
    onDateChange(from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePreset = (p: Preset) => {
    setPreset(p);
    if (p !== 'custom') {
      const { from, to } = getPresetDates(p);
      onDateChange(from, to);
      setOpen(false);
    }
  };

  const applyCustom = () => {
    if (customFrom && customTo) {
      onDateChange(customFrom, customTo);
      setOpen(false);
    }
  };

  const label =
    preset === 'custom' && customFrom && customTo
      ? `${customFrom} → ${customTo}`
      : PRESETS.find((p) => p.id === preset)?.label || 'Last 30 Days';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100"
      >
        <Calendar className="h-4 w-4" />
        <span className="max-w-[180px] truncate">{label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
          {/* Presets */}
          <div className="mb-3 space-y-1">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePreset(p.id)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors
                  ${
                    preset === p.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom range inputs */}
          {preset === 'custom' && (
            <div className="space-y-2 border-t border-gray-200 pt-3">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Start Date</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">End Date</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </div>
              <button
                onClick={applyCustom}
                disabled={!customFrom || !customTo}
                className="w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-40"
              >
                Apply Range
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
