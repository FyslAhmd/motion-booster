'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { BudgetReportInvoice, type BudgetReportRow } from '@/components/invoice/BudgetReportInvoice';
import { useAuth } from '@/lib/auth/context';
import { fetchNextInvoiceNumber } from '@/lib/invoice/client';

interface BudgetHistoryItem {
  id: string;
  amount: number;
  note: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    fullName: string;
    username: string;
  } | null;
}

interface HistoryResponse {
  success: boolean;
  data: BudgetHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

const ITEMS_PER_PAGE = 10;
type TransactionTypeFilter = 'ALL' | 'ADD' | 'DECREASE';

function formatMoney(value: number) {
  const amount = Math.abs(value);
  return `$${amount.toFixed(2)}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleString();
}

function extractMeta(note?: string | null) {
  const source = note || '';
  const directionMatch = source.match(/^\[(ADD|DECREASE)\]/);
  const methodMatch = source.match(/method=([^|]+)/);
  const noteMatch = source.match(/\|\s*note=(.+)$/);

  return {
    direction: directionMatch?.[1] || null,
    method: methodMatch?.[1]?.trim() || null,
    note: noteMatch?.[1]?.trim() || null,
  };
}

export default function ReportsPage() {
  const { user } = useAuth();

  const [items, setItems] = useState<BudgetHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // ── Invoice state ────────────────────────────────────────────────────────
  const [reportRows, setReportRows] = useState<BudgetReportRow[]>([]);
  const [invoiceNo, setInvoiceNo] = useState('');
  const [billDate, setBillDate] = useState('');
  const reportInvoiceRef = useRef<HTMLDivElement>(null);

  const buildParams = useCallback((nextPage: number, limit: number) => {
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: String(limit),
    });

    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (typeFilter !== 'ALL') params.set('type', typeFilter);
    if (fromDate) params.set('from', fromDate);
    if (toDate) params.set('to', toDate);

    return params;
  }, [fromDate, searchTerm, toDate, typeFilter]);

  const loadHistory = useCallback(async (nextPage: number) => {
    try {
      setLoading(true);
      setError('');

      const params = buildParams(nextPage, ITEMS_PER_PAGE);

      const res = await fetch(`/api/v1/reports/budget-history?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      const json: HistoryResponse = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load budget history');
      }

      setItems(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
      setTotalItems(json.pagination?.total || 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load budget history');
      setItems([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, typeFilter, fromDate, toDate]);

  useEffect(() => {
    loadHistory(page);
  }, [page, loadHistory]);

  const rangeLabel = useMemo(() => {
    if (totalItems === 0) return 'No transactions yet';
    const start = (page - 1) * ITEMS_PER_PAGE + 1;
    const end = Math.min(page * ITEMS_PER_PAGE, totalItems);
    return `Showing ${start}–${end} of ${totalItems} transactions`;
  }, [page, totalItems]);

  // ── Step 1: Fetch all rows and build the invoice React component ──────────
  const generateReport = useCallback(async () => {
    if (!fromDate || !toDate) {
      setError('Please select both From and To dates before generating the report.');
      return;
    }
    if (new Date(fromDate).getTime() > new Date(toDate).getTime()) {
      setError('From date cannot be after To date.');
      return;
    }

    try {
      setReportLoading(true);
      setError('');
      setInvoiceNo('');

      const allRows: BudgetHistoryItem[] = [];
      let currentPage = 1;
      let lastPage = 1;

      do {
        const params = buildParams(currentPage, 50);
        const res = await fetch(`/api/v1/reports/budget-history?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
        });
        const json: HistoryResponse = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch report data');
        allRows.push(...(json.data || []));
        lastPage = json.pagination?.totalPages || 1;
        currentPage += 1;
      } while (currentPage <= lastPage);

      if (allRows.length === 0) {
        setError('No transactions found for the selected date range.');
        return;
      }

      const mapped: BudgetReportRow[] = allRows.map((item) => {
        const meta = extractMeta(item.note);
        const isDecrease = item.amount < 0 || meta.direction === 'DECREASE';
        const absAmount = Math.abs(item.amount);
        return {
          date: formatDate(item.createdAt),
          type: isDecrease ? 'Deduct' : 'Add',
          amount: absAmount,
          amountLabel: `${isDecrease ? '-' : '+'}${formatMoney(item.amount)}`,
          method: meta.method || 'N/A',
          isDeduct: isDecrease,
        };
      });

      setReportRows(mapped);
      setInvoiceNo(await fetchNextInvoiceNumber());
      setBillDate(new Date().toLocaleDateString());
    } catch (err: any) {
      setError(err?.message || 'Failed to build report.');
    } finally {
      setReportLoading(false);
    }
  }, [buildParams, fromDate, toDate]);

  // ── Step 2: Render invoice to PNG → jsPDF ────────────────────────────────
  const downloadPdf = useCallback(async () => {
    if (reportRows.length === 0 || !reportInvoiceRef.current) return;

    const [{ jsPDF }, { toPng }] = await Promise.all([
      import('jspdf'),
      import('html-to-image'),
    ]);

    const wrapper = reportInvoiceRef.current.parentElement as HTMLElement;
    const el = reportInvoiceRef.current;

    // Show off-screen so browser lays it out properly
    wrapper.style.position = 'fixed';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.zIndex = '-1';
    wrapper.style.opacity = '0';
    wrapper.style.pointerEvents = 'none';

    await document.fonts.ready;
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    const imgData = await toPng(el, {
      pixelRatio: 2,
      backgroundColor: '#d9d9d9',
    });

    // Restore off-screen
    wrapper.style.position = 'absolute';
    wrapper.style.top = '-9999px';
    wrapper.style.left = '-9999px';
    wrapper.style.zIndex = '-1';
    wrapper.style.opacity = '';

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const renderWidth = pageWidth - margin * 2;

    const img = new Image();
    img.src = imgData;
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
    const renderHeight = (img.height * renderWidth) / img.width;

    let heightLeft = renderHeight;
    let y = margin;
    doc.addImage(imgData, 'PNG', margin, y, renderWidth, renderHeight);
    heightLeft -= pageHeight - margin * 2;

    while (heightLeft > 0) {
      doc.addPage();
      y = margin - (renderHeight - heightLeft);
      doc.addImage(imgData, 'PNG', margin, y, renderWidth, renderHeight);
      heightLeft -= pageHeight - margin * 2;
    }

    doc.save(`budget-report-${fromDate}-to-${toDate}.pdf`);
  }, [reportRows, fromDate, toDate]);

  const clientName = user?.fullName || user?.username || 'Client';

  return (
    <AdminShell>
      <div className="space-y-5 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="mt-1 text-sm text-gray-500">Budget history (recent first)</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by note or method"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TransactionTypeFilter)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="ALL">All Transactions</option>
                <option value="ADD">Add</option>
                <option value="DECREASE">Deduct</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <label className="text-xs font-medium text-gray-600">
                From
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </label>
              <label className="text-xs font-medium text-gray-600">
                To
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={generateReport}
                disabled={reportLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {reportLoading ? 'Building...' : 'Generate Report'}
              </button>
              {reportRows.length > 0 && (
                <button
                  type="button"
                  onClick={downloadPdf}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                >
                  Download PDF
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-700">My Budget History</p>
            <p className="text-xs text-gray-500">{rangeLabel}</p>
          </div>

          <div className="mt-4 space-y-3">
            {loading && <AdminSectionSkeleton variant="table" />}

            {!loading && error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
                {error}
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                No budget history found for your account.
              </div>
            )}

            {!loading && !error && items.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {items.map((item) => {
                  const meta = extractMeta(item.note);
                  const isDecrease = item.amount < 0 || meta.direction === 'DECREASE';

                  return (
                    <div key={item.id} className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {isDecrease ? 'Budget Deducted' : 'Budget Added'}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">{formatDate(item.createdAt)}</p>
                        </div>
                        <p className={`text-lg font-bold ${isDecrease ? 'text-red-600' : 'text-green-600'}`}>
                          {isDecrease ? '-' : '+'}
                          {formatMoney(item.amount)}
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2">
                        <p>
                          <span className="font-semibold text-gray-700">Method:</span>{' '}
                          {meta.method || 'N/A'}
                        </p>
                        {meta.note && (
                          <p className="sm:col-span-2">
                            <span className="font-semibold text-gray-700">Note:</span>{' '}
                            {meta.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!loading && !error && totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Off-screen invoice for PDF capture ─────────────────────────────── */}
      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', zIndex: -1 }}>
        <div ref={reportInvoiceRef} style={{ width: 794 }}>
          {reportRows.length > 0 && (
            <BudgetReportInvoice
              invoiceNo={invoiceNo}
              billDate={billDate}
              clientName={clientName}
              assignBy="Motion Booster Team"
              fromDate={fromDate}
              toDate={toDate}
              rows={reportRows}
            />
          )}
        </div>
      </div>
    </AdminShell>
  );
}
