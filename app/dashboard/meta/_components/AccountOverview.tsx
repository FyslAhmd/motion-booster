'use client';

import React from 'react';
import type { MetaAccount } from './useMetaData';

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  1: { label: 'Active', color: 'bg-green-50 text-green-700 border border-green-200' },
  2: { label: 'Disabled', color: 'bg-red-50 text-red-600 border border-red-200' },
  3: { label: 'Unsettled', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  7: { label: 'Pending Risk Review', color: 'bg-orange-50 text-orange-700 border border-orange-200' },
  8: { label: 'Pending Settlement', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  9: { label: 'In Grace Period', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
  100: { label: 'Pending Closure', color: 'bg-gray-100 text-gray-500' },
  101: { label: 'Closed', color: 'bg-gray-100 text-gray-500' },
  201: { label: 'Any Active', color: 'bg-green-50 text-green-700 border border-green-200' },
  202: { label: 'Any Closed', color: 'bg-gray-100 text-gray-500' },
};

function formatMoney(cents: string | undefined, currency: string) {
  if (!cents) return '-';
  const amount = parseInt(cents, 10) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Formats a value already in major currency units (as returned by the Insights API)
function formatSpend(val: string | undefined, currency: string) {
  if (!val) return '-';
  const amount = parseFloat(val);
  if (isNaN(amount)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatAccountId(accountId: string | undefined) {
  if (!accountId) return '-';
  return accountId.replace(/^act_/i, '');
}

interface Props {
  account: MetaAccount | null;
  lifetimeSpend?: string; // from Insights API maximum preset, already in major currency units
}

export default function AccountOverview({ account, lifetimeSpend }: Props) {
  if (!account) {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
        <p className="text-sm text-gray-400">No account data available.</p>
      </div>
    );
  }

  const status = STATUS_MAP[account.account_status] || {
    label: `Unknown (${account.account_status})`,
    color: 'bg-gray-500/20 text-gray-400',
  };

  const infoItems = [
    { label: 'Account ID', value: formatAccountId(account.id) },
    { label: 'Business Name', value: account.business_name || '-' },
    { label: 'Currency', value: account.currency },
    { label: 'Timezone', value: account.timezone_name },
    {
      label: 'Total Spent',
      value: lifetimeSpend != null
        ? formatSpend(lifetimeSpend, account.currency)
        : formatMoney(account.amount_spent, account.currency),
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
        : '-',
    },
  ];

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-5">
      <div className="mb-4 flex items-center justify-between min-w-0">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{account.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Ad Account Overview</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {infoItems.map((item) => (
          <div key={item.label} className="min-w-0">
            <p className="text-xs text-gray-400 truncate">{item.label}</p>
            <p className={`mt-0.5 text-sm font-semibold truncate ${
              item.highlight ? 'text-red-600' : 'text-gray-800'
            }`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
