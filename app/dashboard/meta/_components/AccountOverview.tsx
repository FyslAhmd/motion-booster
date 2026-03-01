'use client';

import React from 'react';
import type { MetaAccount } from './useMetaData';

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: 'Active', color: 'bg-green-500/20 text-green-400' },
  2: { label: 'Disabled', color: 'bg-red-500/20 text-red-400' },
  3: { label: 'Unsettled', color: 'bg-yellow-500/20 text-yellow-400' },
  7: { label: 'Pending Risk Review', color: 'bg-orange-500/20 text-orange-400' },
  8: { label: 'Pending Settlement', color: 'bg-yellow-500/20 text-yellow-400' },
  9: { label: 'In Grace Period', color: 'bg-blue-500/20 text-blue-400' },
  100: { label: 'Pending Closure', color: 'bg-gray-500/20 text-gray-400' },
  101: { label: 'Closed', color: 'bg-gray-500/20 text-gray-400' },
  201: { label: 'Any Active', color: 'bg-green-500/20 text-green-400' },
  202: { label: 'Any Closed', color: 'bg-gray-500/20 text-gray-400' },
};

function formatMoney(cents: string | undefined, currency: string) {
  if (!cents) return '—';
  const amount = parseInt(cents, 10) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

interface Props {
  account: MetaAccount | null;
}

export default function AccountOverview({ account }: Props) {
  if (!account) {
    return (
      <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6">
        <p className="text-sm text-gray-400">No account data available.</p>
      </div>
    );
  }

  const status = STATUS_MAP[account.account_status] || {
    label: `Unknown (${account.account_status})`,
    color: 'bg-gray-500/20 text-gray-400',
  };

  const infoItems = [
    { label: 'Account ID', value: account.id },
    { label: 'Business Name', value: account.business_name || '—' },
    { label: 'Currency', value: account.currency },
    { label: 'Timezone', value: account.timezone_name },
    {
      label: 'Total Spent',
      value: formatMoney(account.amount_spent, account.currency),
      highlight: true,
    },
    {
      label: 'Balance',
      value: formatMoney(account.balance, account.currency),
    },
    {
      label: 'Spend Cap',
      value: account.spend_cap === '0' ? 'No cap' : formatMoney(account.spend_cap, account.currency),
    },
    {
      label: 'Created',
      value: account.created_time
        ? new Date(account.created_time).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : '—',
    },
  ];

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{account.name}</h3>
          <p className="text-sm text-gray-400">Ad Account Overview</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {infoItems.map((item) => (
          <div key={item.label}>
            <p className="text-xs text-gray-500">{item.label}</p>
            <p
              className={`mt-0.5 text-sm font-medium ${
                item.highlight ? 'text-purple-400' : 'text-gray-200'
              }`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
