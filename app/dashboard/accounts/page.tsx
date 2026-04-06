'use client';

import NextImage from 'next/image';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { AccountsSummaryInvoice } from '@/components/invoice/AccountsSummaryInvoice';
import { fetchNextInvoiceNumber } from '@/lib/invoice/client';
import { useAuth } from '@/lib/auth/context';
import { toast } from 'sonner';
import { X } from 'lucide-react';

type EntryType = 'OTHER' | 'TOTAL_ADJUSTMENT';
type ModalCardType = 'FACEBOOK' | 'OTHERS' | 'TOTAL';

interface ActiveModalState {
  userId: string;
  cardType: ModalCardType;
}

interface UserBudgetRow {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  avatarUrl?: string | null;
  totalSpent: number;
}

interface AccountEntryItem {
  id: string;
  title: string;
  amount: number;
  createdAt: string;
}

interface AccountRowFromApi {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  avatarUrl?: string | null;
  othersTotal: number;
  totalAdjustmentTotal: number;
  otherEntries: AccountEntryItem[];
  totalAdjustmentEntries: AccountEntryItem[];
}

interface AccountCardData {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  avatarUrl?: string | null;
  facebookSpend: number;
  othersTotal: number;
  totalAdjustmentTotal: number;
  otherEntries: AccountEntryItem[];
  totalAdjustmentEntries: AccountEntryItem[];
  totalAmount: number;
}

interface PreparedInvoice {
  invoiceNo: string;
  billDate: string;
  clientName: string;
  assignBy: string;
  facebookSpend: number;
  otherEntries: Array<{ title: string; amount: number }>;
  totalAdjustments: Array<{ title: string; amount: number }>;
  totalAmount: number;
}

function formatAmount(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function initialsFromName(fullName?: string, username?: string): string {
  const source = fullName?.trim() || username?.trim() || 'U';
  return source
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return fallback;
}

export default function AccountsPage() {
  const { accessToken, refreshSession } = useAuth();
  const [users, setUsers] = useState<AccountCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [activeModal, setActiveModal] = useState<ActiveModalState | null>(null);
  const [savingAction, setSavingAction] = useState<{ userId: string; type: EntryType } | null>(null);

  const [invoicePayload, setInvoicePayload] = useState<PreparedInvoice | null>(null);
  const [generatingInvoiceFor, setGeneratingInvoiceFor] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const otherTitleInputRef = useRef<HTMLInputElement>(null);
  const otherAmountInputRef = useRef<HTMLInputElement>(null);
  const refreshInFlightRef = useRef<Promise<string | null> | null>(null);

  const refreshSessionOnce = useCallback(async (): Promise<string | null> => {
    if (!refreshInFlightRef.current) {
      refreshInFlightRef.current = refreshSession().finally(() => {
        refreshInFlightRef.current = null;
      });
    }

    return refreshInFlightRef.current;
  }, [refreshSession]);

  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const buildHeaders = (token: string | null) => {
      const headers = new Headers(options.headers || {});
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    };

    let response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: buildHeaders(accessToken),
    });

    if (response.status !== 401) {
      return response;
    }

    const refreshedToken = await refreshSessionOnce();
    if (!refreshedToken) {
      return response;
    }

    response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: buildHeaders(refreshedToken),
    });

    return response;
  }, [accessToken, refreshSessionOnce]);

  const loadData = useCallback(async (showPageLoader = true) => {
    try {
      if (showPageLoader) {
        setLoading(true);
      }
      setError('');

      const [budgetsResult, accountsResult] = await Promise.allSettled([
        authFetch('/api/v1/admin/user-budgets', {
          method: 'GET',
        }),
        authFetch('/api/v1/admin/accounts', {
          method: 'GET',
        }),
      ]);

      let budgetRows: UserBudgetRow[] = [];
      let accountRows: AccountRowFromApi[] = [];

      if (budgetsResult.status === 'fulfilled') {
        const budgetsJson = await budgetsResult.value.json();
        if (budgetsResult.value.ok && budgetsJson?.success && Array.isArray(budgetsJson?.data)) {
          budgetRows = budgetsJson.data as UserBudgetRow[];
        }
      }

      if (accountsResult.status === 'fulfilled') {
        const accountsJson = await accountsResult.value.json();
        if (accountsResult.value.ok && accountsJson?.success && Array.isArray(accountsJson?.data)) {
          accountRows = accountsJson.data as AccountRowFromApi[];
        }
      }

      if (budgetRows.length === 0 && accountRows.length === 0) {
        throw new Error('Failed to load account data. Please try again.');
      }

      const budgetsByUserId = new Map(budgetRows.map((row) => [row.id, row]));
      const accountsByUserId = new Map(accountRows.map((row) => [row.id, row]));
      const allUserIds = Array.from(new Set([...budgetsByUserId.keys(), ...accountsByUserId.keys()]));

      const merged = allUserIds
        .map((userId) => {
          const budget = budgetsByUserId.get(userId);
          const account = accountsByUserId.get(userId);

          const facebookSpend = Number(budget?.totalSpent || 0);
          const othersTotal = Number(account?.othersTotal || 0);
          const totalAdjustmentTotal = Number(account?.totalAdjustmentTotal || 0);

          return {
            id: userId,
            username: budget?.username || account?.username || 'unknown',
            email: budget?.email || account?.email || '',
            fullName: budget?.fullName || account?.fullName || 'Unknown User',
            phone: budget?.phone || account?.phone || '',
            status: budget?.status || account?.status || 'ACTIVE',
            avatarUrl: budget?.avatarUrl || account?.avatarUrl || null,
            facebookSpend,
            othersTotal,
            totalAdjustmentTotal,
            otherEntries: account?.otherEntries || [],
            totalAdjustmentEntries: account?.totalAdjustmentEntries || [],
            totalAmount: Number((facebookSpend + othersTotal + totalAdjustmentTotal).toFixed(2)),
          } satisfies AccountCardData;
        })
        .sort((a, b) => a.fullName.localeCompare(b.fullName));

      setUsers(merged);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load accounts.'));
      setUsers([]);
    } finally {
      if (showPageLoader) {
        setLoading(false);
      }
    }
  }, [authFetch]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const deferredSearch = useDeferredValue(search);

  const filteredUsers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return users;

    return users.filter((item) => {
      return (
        item.fullName.toLowerCase().includes(query) ||
        item.username.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.phone.toLowerCase().includes(query)
      );
    });
  }, [users, deferredSearch]);

  const summary = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc.facebookSpend += user.facebookSpend;
        acc.othersTotal += user.othersTotal;
        acc.totalAmount += user.totalAmount;
        return acc;
      },
      {
        facebookSpend: 0,
        othersTotal: 0,
        totalAmount: 0,
      },
    );
  }, [users]);

  const selectedModalUser = useMemo(
    () => users.find((item) => item.id === activeModal?.userId) || null,
    [users, activeModal?.userId],
  );
  const selectedModalUserId = selectedModalUser?.id || null;

  useEffect(() => {
    if (!selectedModalUserId || activeModal?.cardType !== 'OTHERS') {
      return;
    }

    if (otherTitleInputRef.current) {
      otherTitleInputRef.current.value = '';
    }
    if (otherAmountInputRef.current) {
      otherAmountInputRef.current.value = '';
    }
  }, [selectedModalUserId, activeModal?.cardType]);

  const openCardModal = useCallback((userId: string, cardType: ModalCardType) => {
    setActiveModal({ userId, cardType });
  }, []);

  const createEntry = useCallback(async (input: {
    userId: string;
    type: EntryType;
    title: string;
    amount: string;
  }) => {
    const cleanTitle = input.title.trim();
    const amount = Number(input.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Please enter a valid positive amount.');
      return false;
    }

    if (input.type === 'OTHER' && !cleanTitle) {
      toast.error('Title is required for Others.');
      return false;
    }

    try {
      setSavingAction({ userId: input.userId, type: input.type });

      const res = await authFetch('/api/v1/admin/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: input.userId,
          type: input.type,
          title: cleanTitle,
          amount,
        }),
      });

      if (res.status === 401) {
        throw new Error('Session expired or unauthorized access. Please login again.');
      }

      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || 'Failed to save entry');
      }

      await loadData(false);
      toast.success('Entry added successfully.');
      return true;
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to add entry.'));
      return false;
    } finally {
      setSavingAction(null);
    }
  }, [authFetch, loadData]);

  const handleAddOther = async (userId: string) => {
    const current = {
      title: otherTitleInputRef.current?.value || '',
      amount: otherAmountInputRef.current?.value || '',
    };

    const ok = await createEntry({
      userId,
      type: 'OTHER',
      title: current.title,
      amount: current.amount,
    });

    if (ok) {
      if (otherTitleInputRef.current) {
        otherTitleInputRef.current.value = '';
      }
      if (otherAmountInputRef.current) {
        otherAmountInputRef.current.value = '';
      }
    }
  };

  const generateInvoiceForUser = useCallback(async (target: AccountCardData) => {
    try {
      setGeneratingInvoiceFor(target.id);

      const invoiceNo = await fetchNextInvoiceNumber();
      const payload: PreparedInvoice = {
        invoiceNo,
        billDate: new Date().toLocaleDateString('en-US'),
        clientName: target.fullName || target.username,
        assignBy: 'Motion Booster Accounts Team',
        facebookSpend: target.facebookSpend,
        otherEntries: target.otherEntries.map((item) => ({
          title: item.title,
          amount: Number(item.amount || 0),
        })),
        totalAdjustments: target.totalAdjustmentEntries.map((item) => ({
          title: item.title,
          amount: Number(item.amount || 0),
        })),
        totalAmount: target.totalAmount,
      };

      setInvoicePayload(payload);

      await document.fonts.ready;
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });

      if (!invoiceRef.current) {
        throw new Error('Invoice rendering node not found.');
      }

      const [{ jsPDF }, { toPng }] = await Promise.all([
        import('jspdf'),
        import('html-to-image'),
      ]);

      const wrapper = invoiceRef.current.parentElement as HTMLElement;
      const el = invoiceRef.current;

      wrapper.style.position = 'fixed';
      wrapper.style.top = '0';
      wrapper.style.left = '0';
      wrapper.style.zIndex = '-1';
      wrapper.style.opacity = '0';
      wrapper.style.pointerEvents = 'none';

      const imageData = await toPng(el, {
        pixelRatio: 2,
        backgroundColor: '#d9d9d9',
      });

      wrapper.style.position = 'absolute';
      wrapper.style.top = '-9999px';
      wrapper.style.left = '-9999px';
      wrapper.style.zIndex = '-1';
      wrapper.style.opacity = '';
      wrapper.style.pointerEvents = 'none';

      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 16;
      const renderWidth = pageWidth - margin * 2;

      const image = new window.Image();
      image.src = imageData;
      await new Promise<void>((resolve) => {
        image.onload = () => resolve();
        image.onerror = () => resolve();
      });

      const renderHeight = (image.height * renderWidth) / image.width;

      let heightLeft = renderHeight;
      let y = margin;
      doc.addImage(imageData, 'PNG', margin, y, renderWidth, renderHeight);
      heightLeft -= pageHeight - margin * 2;

      while (heightLeft > 0) {
        doc.addPage();
        y = margin - (renderHeight - heightLeft);
        doc.addImage(imageData, 'PNG', margin, y, renderWidth, renderHeight);
        heightLeft -= pageHeight - margin * 2;
      }

      const safeName = (target.fullName || target.username || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      doc.save(`${safeName || 'user'}-accounts-invoice-${invoiceNo}.pdf`);
      toast.success('Invoice generated successfully.');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to generate invoice.'));
    } finally {
      setGeneratingInvoiceFor(null);
    }
  }, []);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage per-user Facebook spend, add unlimited others entries, and maintain total adjustments.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-500">Facebook Spend</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">{formatAmount(summary.facebookSpend)}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-500">Others Total</p>
            <p className="mt-1 text-2xl font-bold text-amber-700">{formatAmount(summary.othersTotal)}</p>
          </div>
          <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-green-500">Grand Total</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{formatAmount(summary.totalAmount)}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, username, email, or phone"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>

        {loading && <AdminSectionSkeleton variant="table" />}

        {!loading && error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-10 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
                No users found for this search.
              </div>
            ) : (
              filteredUsers.map((user) => {
                const initials = initialsFromName(user.fullName, user.username);

                return (
                  <div key={user.id} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                      <div className="flex min-w-0 items-center gap-3">
                        {user.avatarUrl ? (
                          <NextImage
                            src={user.avatarUrl}
                            alt={user.fullName || user.username}
                            width={44}
                            height={44}
                            className="h-11 w-11 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                            {initials}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{user.fullName || user.username}</p>
                          <p className="truncate text-xs text-gray-500">{user.email || 'No email'}</p>
                          <p className="truncate text-xs text-gray-400">{user.phone || 'No phone'}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => void generateInvoiceForUser(user)}
                        disabled={generatingInvoiceFor === user.id}
                        className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {generatingInvoiceFor === user.id ? 'Generating...' : 'Generate Invoice'}
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => openCardModal(user.id, 'FACEBOOK')}
                        className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-left transition-colors hover:bg-blue-100"
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">Facebook Spend</p>
                        <p className="mt-1 text-xl font-bold text-blue-700">{formatAmount(user.facebookSpend)}</p>
                        <p className="mt-1 text-[11px] font-medium text-blue-700">Click to view details</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => openCardModal(user.id, 'OTHERS')}
                        className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-left transition-colors hover:bg-amber-100"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">Others</p>
                          <p className="text-sm font-bold text-amber-700">{formatAmount(user.othersTotal)}</p>
                        </div>
                        <p className="mt-2 text-xs text-amber-700">
                          Entries: {user.otherEntries.length}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-amber-700">Click to view and add entry</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => openCardModal(user.id, 'TOTAL')}
                        className="rounded-xl border border-green-100 bg-green-50 p-3 text-left transition-colors hover:bg-green-100"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-green-500">Total</p>
                          <p className="text-xl font-bold text-green-700">{formatAmount(user.totalAmount)}</p>
                        </div>

                        <div className="mt-2 rounded-lg border border-green-200 bg-white/80 p-2 text-xs text-gray-700">
                          <p>Facebook: {formatAmount(user.facebookSpend)}</p>
                          <p>Others: {formatAmount(user.othersTotal)}</p>
                          <p>Total Adds: {formatAmount(user.totalAdjustmentTotal)}</p>
                        </div>

                        <p className="mt-2 text-[11px] font-medium text-green-700">Click to view details</p>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {selectedModalUser && activeModal && (
        <div
          className="fixed inset-0 z-120 flex items-center justify-center bg-black/60 p-3 sm:p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-[min(760px,96vw)] max-h-[88vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_28px_90px_-30px_rgba(0,0,0,0.65)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-5 py-4 sm:px-6 sm:py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">
                    {activeModal.cardType === 'FACEBOOK'
                      ? 'Facebook Spend Details'
                      : activeModal.cardType === 'OTHERS'
                        ? 'Others Details'
                        : 'Total Details'}
                  </h3>
                  <p className="mt-0.5 truncate text-sm text-gray-500">{selectedModalUser.fullName || selectedModalUser.username}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-600 sm:inline-flex">
                    {activeModal.cardType}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-[calc(88vh-92px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="space-y-4 bg-white p-4 sm:p-6">
                {activeModal.cardType === 'FACEBOOK' ? (
                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Current Facebook Spend</p>
                      <p className="mt-2 text-3xl font-bold text-blue-700">{formatAmount(selectedModalUser.facebookSpend)}</p>
                      <p className="mt-2 text-xs text-blue-700/90">This amount is synced from ad spend records.</p>
                    </div>
                  </div>
                ) : activeModal.cardType === 'OTHERS' ? (
                  <>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <p className="text-sm font-semibold text-gray-900">Add New Others Entry</p>
                      <p className="mt-1 text-xs text-gray-500">Provide a title and amount for this user.</p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <input
                          ref={otherTitleInputRef}
                          type="text"
                          defaultValue=""
                          autoComplete="off"
                          placeholder="Title (e.g. Domain, Hosting)"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                        <input
                          ref={otherAmountInputRef}
                          type="number"
                          min="0"
                          step="0.01"
                          defaultValue=""
                          inputMode="decimal"
                          placeholder="Amount"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                      </div>

                      <div className="mt-3 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => void handleAddOther(selectedModalUser.id)}
                          disabled={savingAction?.userId === selectedModalUser.id && savingAction.type === 'OTHER'}
                          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingAction?.userId === selectedModalUser.id && savingAction.type === 'OTHER'
                            ? 'Saving...'
                            : 'Add Amount'}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-700">Others Entries</p>
                        <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600 shadow-sm">
                          {selectedModalUser.otherEntries.length} item{selectedModalUser.otherEntries.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                        {selectedModalUser.otherEntries.length === 0 ? null : (
                          selectedModalUser.otherEntries.map((entry) => (
                            <div key={entry.id} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-sm font-medium text-gray-800">{entry.title}</span>
                                <span className="text-sm font-semibold text-red-600">{formatAmount(entry.amount)}</span>
                              </div>
                              <p className="mt-1 text-[11px] text-gray-500">
                                {new Date(entry.createdAt).toLocaleDateString('en-GB')}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm text-gray-700">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-700">Amount Breakdown</p>
                      <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                        <span>Facebook Spend</span>
                        <span className="font-semibold text-gray-900">{formatAmount(selectedModalUser.facebookSpend)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-2">
                        <span>Others</span>
                        <span className="font-semibold text-gray-900">{formatAmount(selectedModalUser.othersTotal)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between rounded-lg bg-white px-3 py-2">
                        <span>Total Adds</span>
                        <span className="font-semibold text-gray-900">{formatAmount(selectedModalUser.totalAdjustmentTotal)}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between rounded-xl bg-red-600 px-3 py-2 text-base text-white">
                        <span className="font-semibold">Grand Total</span>
                        <span className="font-bold">{formatAmount(selectedModalUser.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">Total Adjustment Entries</p>
                        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                          {selectedModalUser.totalAdjustmentEntries.length} item{selectedModalUser.totalAdjustmentEntries.length === 1 ? '' : 's'}
                        </span>
                      </div>

                      <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                        {selectedModalUser.totalAdjustmentEntries.length === 0 ? null : (
                          selectedModalUser.totalAdjustmentEntries.map((entry) => (
                            <div key={entry.id} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-sm font-medium text-gray-800">{entry.title}</span>
                                <span className="text-sm font-semibold text-gray-900">{formatAmount(entry.amount)}</span>
                              </div>
                              <p className="mt-1 text-[11px] text-gray-500">
                                {new Date(entry.createdAt).toLocaleDateString('en-GB')}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="absolute z-[-1] opacity-0 pointer-events-none"
        style={{ left: -9999, top: -9999 }}
      >
        {invoicePayload && (
          <div ref={invoiceRef} style={{ width: 794 }}>
            <AccountsSummaryInvoice
              invoiceNo={invoicePayload.invoiceNo}
              billDate={invoicePayload.billDate}
              clientName={invoicePayload.clientName}
              assignBy={invoicePayload.assignBy}
              facebookSpend={invoicePayload.facebookSpend}
              otherEntries={invoicePayload.otherEntries}
              totalAdjustments={invoicePayload.totalAdjustments}
              totalAmount={invoicePayload.totalAmount}
            />
          </div>
        )}
      </div>
    </AdminShell>
  );
}
