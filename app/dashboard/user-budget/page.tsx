'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';

interface UserBudgetRow {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  createdAt: string;
  avatarUrl?: string | null;
  totalBudget: number;
  totalSpent: number;
  balance: number;
  depositsCount: number;
  lastDepositAt: string | null;
  assignedCounts: {
    campaigns: number;
    adSets: number;
    ads: number;
  };
}

function money(v: number) {
  return `$${v.toFixed(2)}`;
}

function initialsFromName(fullName?: string, username?: string) {
  const source = fullName?.trim() || username?.trim() || 'U';
  return source
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function UserBudgetPage() {
  const [users, setUsers] = useState<UserBudgetRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [depositInputs, setDepositInputs] = useState<Record<string, string>>({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const loadData = useCallback(async (showPageLoader = true) => {
    try {
      if (showPageLoader) {
        setLoading(true);
      }
      setError('');

      const res = await fetch('/api/v1/admin/user-budgets', {
        method: 'GET',
        credentials: 'include',
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch user budgets');
      }

      setUsers(json.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load user budgets');
    } finally {
      if (showPageLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totals = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc.totalBudget += user.totalBudget;
        acc.totalSpent += user.totalSpent;
        acc.balance += user.balance;
        return acc;
      },
      { totalBudget: 0, totalSpent: 0, balance: 0 },
    );
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;

    return users.filter((user) => {
      return (
        user.fullName?.toLowerCase().includes(q) ||
        user.username?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.phone?.toLowerCase().includes(q)
      );
    });
  }, [users, search]);

  const submitDeposit = async (userId: string) => {
    const value = depositInputs[userId] || '';
    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Please enter a valid positive deposit amount.');
      return;
    }

    try {
      setSavingUserId(userId);
      setError('');

      const res = await fetch('/api/v1/admin/user-budgets/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, amount }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to add deposit');
      }

      setDepositInputs((prev) => ({ ...prev, [userId]: '' }));
      await loadData(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to add deposit');
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Budget</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track deposits, assigned ads spend, and current balance per user.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-2.5 py-2.5 sm:px-4 sm:py-3">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-blue-500">Total Deposited</p>
            <p className="mt-1 text-lg sm:text-2xl font-bold text-blue-700">{money(totals.totalBudget)}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-2.5 py-2.5 sm:px-4 sm:py-3">
            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wide text-amber-500">Total Spent</p>
            <p className="mt-1 text-lg sm:text-2xl font-bold text-amber-700">{money(totals.totalSpent)}</p>
          </div>
          <div className={`rounded-xl border px-2.5 py-2.5 sm:px-4 sm:py-3 ${totals.balance >= 0 ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
            <p className={`text-[10px] sm:text-xs font-medium uppercase tracking-wide ${totals.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>Net Balance</p>
            <p className={`mt-1 text-lg sm:text-2xl font-bold ${totals.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>{money(totals.balance)}</p>
          </div>
        </div>

        {loading && <AdminSectionSkeleton variant="table" />}

        {error && !loading && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="rounded-xl border border-gray-100 bg-white">
            <div className="border-b border-gray-100 px-4 py-3 sm:px-6">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user by name, username, email, or phone"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
            <div className="p-3 sm:p-4">
              {filteredUsers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500">
                  No users found for this search.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  {filteredUsers.map((user) => {
                    const initials = initialsFromName(user.fullName, user.username);
                    return (
                      <div key={user.id} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <Image
                              src={user.avatarUrl}
                              alt={user.fullName || user.username}
                              width={40}
                              height={40}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-600">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">{user.fullName || user.username || '—'}</p>
                            <p className="truncate text-xs text-gray-500">{user.phone || 'No phone'}</p>
                            <p className="truncate text-xs text-gray-400">{user.email || '—'}</p>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="rounded-lg border border-blue-100 bg-blue-50 px-2 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-blue-500">Budget</p>
                            <p className="mt-0.5 text-sm font-semibold text-blue-700">{money(user.totalBudget)}</p>
                          </div>
                          <div className="rounded-lg border border-amber-100 bg-amber-50 px-2 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-amber-500">Spent</p>
                            <p className="mt-0.5 text-sm font-semibold text-amber-700">{money(user.totalSpent)}</p>
                          </div>
                          <div className={`rounded-lg border px-2 py-2 ${user.balance >= 0 ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                            <p className={`text-[10px] uppercase tracking-wide ${user.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>Balance</p>
                            <p className={`mt-0.5 text-sm font-semibold ${user.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>{money(user.balance)}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Deposit amount"
                            value={depositInputs[user.id] ?? ''}
                            onChange={(e) =>
                              setDepositInputs((prev) => ({
                                ...prev,
                                [user.id]: e.target.value,
                              }))
                            }
                            className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                          />
                          <button
                            onClick={() => submitDeposit(user.id)}
                            disabled={savingUserId === user.id}
                            className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {savingUserId === user.id ? 'Saving...' : 'Add'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
