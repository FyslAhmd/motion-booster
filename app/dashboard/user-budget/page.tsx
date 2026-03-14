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

export default function UserBudgetPage() {
  const [users, setUsers] = useState<UserBudgetRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [depositInputs, setDepositInputs] = useState<Record<string, string>>({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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
      await loadData();
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-500">Total Deposited</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">{money(totals.totalBudget)}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-500">Total Spent</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{money(totals.totalSpent)}</p>
          </div>
          <div className={`rounded-xl border px-4 py-3 ${totals.balance >= 0 ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
            <p className={`text-xs font-medium uppercase tracking-wide ${totals.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>Net Balance</p>
            <p className={`mt-1 text-2xl font-bold ${totals.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>{money(totals.balance)}</p>
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
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-3 font-medium">Profile</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Total Budget</th>
                    <th className="px-4 py-3 font-medium">Spent</th>
                    <th className="px-4 py-3 font-medium">Balance</th>
                    <th className="px-4 py-3 font-medium">Add Deposit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => {
                    const initials =
                      user.fullName
                        ?.split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'U';

                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-3">
                          {user.avatarUrl ? (
                            <Image
                              src={user.avatarUrl}
                              alt={user.fullName || user.username}
                              width={36}
                              height={36}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-600">
                              {initials}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{user.fullName || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{user.phone || '—'}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-blue-700">{money(user.totalBudget)}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-amber-700">{money(user.totalSpent)}</td>
                        <td className={`whitespace-nowrap px-4 py-3 font-semibold ${user.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                          {money(user.balance)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Amount"
                              value={depositInputs[user.id] ?? ''}
                              onChange={(e) =>
                                setDepositInputs((prev) => ({
                                  ...prev,
                                  [user.id]: e.target.value,
                                }))
                              }
                              className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                            />
                            <button
                              onClick={() => submitDeposit(user.id)}
                              disabled={savingUserId === user.id}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              {savingUserId === user.id ? 'Saving...' : 'Add'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                        No users found for this search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
