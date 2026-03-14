'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Building2 } from 'lucide-react';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';

interface AdAccount {
  id: string;
  name: string;
  account_status: number;
  currency?: string;
  amount_spent?: string;
  business_name?: string;
}

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: 'Active', color: 'bg-green-500' },
  2: { label: 'Disabled', color: 'bg-red-500' },
  3: { label: 'Unsettled', color: 'bg-yellow-500' },
  7: { label: 'Pending', color: 'bg-blue-500' },
  9: { label: 'In Grace', color: 'bg-orange-500' },
  100: { label: 'Closed', color: 'bg-gray-500' },
  101: { label: 'Closed', color: 'bg-gray-500' },
};

interface AccountSwitcherProps {
  value: string;              // currently selected account id
  onChange: (id: string) => void;
}

export default function AccountSwitcher({ value, onChange }: AccountSwitcherProps) {
  const [accounts, setAccounts] = useState<AdAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [lifetimeSpendMap, setLifetimeSpendMap] = useState<Record<string, string>>({});
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/v1/meta/account?discover=1')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setAccounts(json.data);
          // Auto-select first account if none selected
          if (!value && json.data.length > 0) {
            onChange(json.data[0].id);
          }
          // Fetch lifetime spend for each account in parallel
          const accs: AdAccount[] = json.data;
          Promise.allSettled(
            accs.map((acc) =>
              fetch(`/api/v1/meta/insights?type=account&date_preset=maximum&account_id=${encodeURIComponent(acc.id)}`)
                .then((r) => r.json())
                .then((j) => ({ id: acc.id, spend: j.data?.[0]?.spend as string | undefined }))
            )
          ).then((results) => {
            const map: Record<string, string> = {};
            for (const r of results) {
              if (r.status === 'fulfilled' && r.value.spend != null) {
                map[r.value.id] = r.value.spend;
              }
            }
            setLifetimeSpendMap(map);
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = accounts.find((a) => a.id === value);

  if (loading) {
    return <AdminSectionSkeleton variant="inline" />;
  }

  if (accounts.length <= 1) return null; // No switcher needed for single account

  return (
    <div className="relative w-full min-w-0" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition-colors hover:border-red-300 hover:bg-gray-50"
      >
        <Building2 className="h-4 w-4 shrink-0 text-red-500" />
        <span className="min-w-0 flex-1 truncate text-left">{selected?.name || 'Select account'}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-gray-200 bg-white shadow-xl shadow-black/10">
          <div className="max-h-80 overflow-y-auto py-1">
            {accounts.map((acc) => {
              const st = STATUS_MAP[acc.account_status] || { label: 'Unknown', color: 'bg-gray-500' };
              const isActive = acc.id === value;
              return (
                <button
                  key={acc.id}
                  onClick={() => { onChange(acc.id); setOpen(false); }}
                  className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                    isActive ? 'bg-red-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`truncate text-sm font-medium ${isActive ? 'text-red-600' : 'text-gray-800'}`}>
                      {acc.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${st.color}`} />
                      <span>{st.label}</span>
                      {(lifetimeSpendMap[acc.id] != null || acc.amount_spent) && (
                        <>
                          <span>·</span>
                          <span>
                            {lifetimeSpendMap[acc.id] != null
                              ? `$${parseFloat(lifetimeSpendMap[acc.id]).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                              : `$${(parseInt(acc.amount_spent!, 10) / 100).toLocaleString()}`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {isActive && (
                    <span className="mt-1 text-xs text-red-500">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
