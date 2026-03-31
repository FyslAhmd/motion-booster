'use client';

import { useRef, useState, useEffect } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import { CampaignsTable } from '../meta/_components';
import { Search, Filter, Activity, BarChart3, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { CampaignReportInvoice } from '@/components/invoice';

interface CampaignLite {
  id: string;
  status?: string;
  effective_status?: string;
}

interface ReportCampaign extends CampaignLite {
  name?: string;
  start_time?: string;
  stop_time?: string;
  created_time?: string;
}

interface GoalConfig {
  metricLabel: string;
  costLabel: string;
  actionTypes: string[];
}

interface ReportRow {
  date: string;
  adCreateDate: string;
  adEndDate: string;
  campaignName: string;
  spendUsd: number;
  spendTk: number;
  goal: string;
  goalResult: number;
  costPerGoalResult: number;
  reach: number;
  impressions: number;
}

const USD_TO_TK_RATE = 145;

const GOAL_TO_DYNAMIC_METRIC: Record<string, GoalConfig> = {
  CONVERSATIONS: {
    metricLabel: 'Messages',
    costLabel: 'Cost / Message',
    actionTypes: [
      'onsite_conversion.total_messaging_connection',
      'onsite_conversion.messaging_conversation_started_7d',
    ],
  },
  MESSAGING_PURCHASE_CONVERSION: {
    metricLabel: 'Messages',
    costLabel: 'Cost / Message',
    actionTypes: [
      'onsite_conversion.messaging_conversation_started_7d',
      'onsite_conversion.total_messaging_connection',
    ],
  },
  LEAD_GENERATION: {
    metricLabel: 'Leads',
    costLabel: 'Cost / Lead',
    actionTypes: ['lead', 'onsite_conversion.lead', 'onsite_web_lead'],
  },
  LINK_CLICKS: {
    metricLabel: 'Link Clicks',
    costLabel: 'Cost / Click',
    actionTypes: ['link_click'],
  },
  LANDING_PAGE_VIEWS: {
    metricLabel: 'LPV',
    costLabel: 'Cost / LPV',
    actionTypes: ['landing_page_view', 'link_click'],
  },
  OFFSITE_CONVERSIONS: {
    metricLabel: 'Purchases',
    costLabel: 'Cost / Purchase',
    actionTypes: ['purchase', 'onsite_web_purchase'],
  },
  POST_ENGAGEMENT: {
    metricLabel: 'Engagement',
    costLabel: 'Cost / Engagement',
    actionTypes: ['post_engagement', 'page_engagement'],
  },
  THRUPLAY: {
    metricLabel: 'Video Views',
    costLabel: 'Cost / View',
    actionTypes: ['video_view', 'thruplay'],
  },
  REACH: {
    metricLabel: 'Reach Result',
    costLabel: 'Cost / Reach',
    actionTypes: ['reach'],
  },
};

function fmtCurrency(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtTk(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(value?: string) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDateTs(value?: string, endOfDay = false) {
  if (!value) return Number.NaN;
  const suffix = endOfDay ? 'T23:59:59' : 'T00:00:00';
  return new Date(`${value}${suffix}`).getTime();
}

function parseCampaignInsight(raw: any) {
  const insight = Array.isArray(raw?.data) ? raw.data[0] : Array.isArray(raw) ? raw[0] : raw;
  if (!insight) {
    return {
      spend: 0,
      reach: 0,
      impressions: 0,
      getAction: () => 0,
      getCost: () => 0,
    };
  }

  const actions = insight.actions || [];
  const costs = insight.cost_per_action_type || [];

  return {
    spend: Number(insight.spend || 0),
    reach: Number(insight.reach || 0),
    impressions: Number(insight.impressions || 0),
    getAction: (type: string) => Number(actions.find((a: any) => a.action_type === type)?.value || 0),
    getCost: (type: string) => Number(costs.find((a: any) => a.action_type === type)?.value || 0),
  };
}

function resolveGoalResult(goal: string, parsed: ReturnType<typeof parseCampaignInsight>) {
  const cfg = GOAL_TO_DYNAMIC_METRIC[goal] || GOAL_TO_DYNAMIC_METRIC.LINK_CLICKS;
  if (goal === 'REACH') {
    const cost = parsed.reach > 0 ? parsed.spend / parsed.reach : 0;
    return { label: cfg.metricLabel, costLabel: cfg.costLabel, value: parsed.reach, costValue: cost };
  }

  for (const actionType of cfg.actionTypes) {
    const value = parsed.getAction(actionType);
    if (value > 0) {
      return {
        label: cfg.metricLabel,
        costLabel: cfg.costLabel,
        value,
        costValue: parsed.getCost(actionType),
      };
    }
  }

  return {
    label: cfg.metricLabel,
    costLabel: cfg.costLabel,
    value: 0,
    costValue: 0,
  };
}

export default function MyCampaignsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [refreshTick, setRefreshTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [assignedCampaignIds, setAssignedCampaignIds] = useState<string[]>([]);
  const [campaignAccountById, setCampaignAccountById] = useState<Record<string, string>>({});
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false);
  const [activeCampaignCount, setActiveCampaignCount] = useState<number | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportFromDate, setReportFromDate] = useState('');
  const [reportToDate, setReportToDate] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportRows, setReportRows] = useState<ReportRow[]>([]);
  const [reportGeneratedAt, setReportGeneratedAt] = useState('');
  const [reportInvoiceNo, setReportInvoiceNo] = useState('');
  const reportInvoiceRef = useRef<HTMLDivElement>(null);
  const countsLoading = activeCampaignCount === null;

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    setAssignmentsLoaded(false);
    fetch(`/api/v1/admin/meta-assignments/users/${user.id}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled || !json?.success) return;

        const campaigns = Array.isArray(json?.data?.campaigns) ? json.data.campaigns : [];
        const ids = campaigns
          .map((c: { metaObjectId?: string }) => c?.metaObjectId)
          .filter((id: string | undefined): id is string => typeof id === 'string' && id.length > 0);

        const accountMap: Record<string, string> = {};
        campaigns.forEach((c: { metaObjectId?: string; metaAccountId?: string }) => {
          if (c?.metaObjectId && c?.metaAccountId) {
            accountMap[c.metaObjectId] = c.metaAccountId;
          }
        });

        setAssignedCampaignIds(Array.from(new Set(ids)));
        setCampaignAccountById(accountMap);
        setAssignmentsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) {
          setAssignedCampaignIds([]);
          setCampaignAccountById({});
          setAssignmentsLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id, refreshTick]);

  useEffect(() => {
    if (!assignmentsLoaded) return;

    const uniqueIds = Array.from(new Set(assignedCampaignIds.filter(Boolean)));
    if (uniqueIds.length === 0) {
      setActiveCampaignCount(0);
      return;
    }

    let cancelled = false;
    const loadActiveCount = async () => {
      setActiveCampaignCount(null);
      try {
        const chunkSize = 40;
        const allCampaigns: CampaignLite[] = [];

        for (let i = 0; i < uniqueIds.length; i += chunkSize) {
          const chunk = uniqueIds.slice(i, i + chunkSize);
          const params = new URLSearchParams({ type: 'CAMPAIGN', ids: chunk.join(',') });
          const res = await fetch(`/api/v1/meta/by-ids?${params.toString()}`);
          const json = await res.json();
          if (json?.success && Array.isArray(json.data)) {
            allCampaigns.push(...json.data);
          }
        }

        const activeCount = allCampaigns.filter(
          (c) => c?.status === 'ACTIVE' || c?.effective_status === 'ACTIVE',
        ).length;

        if (!cancelled) {
          setActiveCampaignCount(activeCount);
        }
      } catch {
        if (!cancelled) {
          setActiveCampaignCount(0);
        }
      }
    };

    loadActiveCount();
    return () => {
      cancelled = true;
    };
  }, [assignmentsLoaded, assignedCampaignIds, refreshTick]);

  useEffect(() => {
    if (refreshing && assignmentsLoaded && activeCampaignCount !== null) {
      setRefreshing(false);
    }
  }, [refreshing, assignmentsLoaded, activeCampaignCount]);

  const handleRefresh = () => {
    setRefreshing(true);
    setActiveCampaignCount(null);
    setRefreshTick((prev) => prev + 1);
  };

  const fetchCampaignsByIds = async (ids: string[]) => {
    const chunkSize = 40;
    const collected: ReportCampaign[] = [];
    const uniqueIds = Array.from(new Set(ids.filter(Boolean)));

    for (let i = 0; i < uniqueIds.length; i += chunkSize) {
      const chunk = uniqueIds.slice(i, i + chunkSize);
      const params = new URLSearchParams({ type: 'CAMPAIGN', ids: chunk.join(',') });
      const res = await fetch(`/api/v1/meta/by-ids?${params.toString()}`);
      const json = await res.json();
      if (json?.success && Array.isArray(json.data)) {
        collected.push(...json.data);
      }
    }

    return collected;
  };

  const getDominantGoalForCampaign = async (campaignId: string) => {
    const params = new URLSearchParams({ campaign_id: campaignId, limit: '50' });
    const res = await fetch(`/api/v1/meta/adsets?${params.toString()}`);
    const json = await res.json();
    const adSets = Array.isArray(json?.data) ? json.data : [];

    const counts = new Map<string, number>();
    adSets.forEach((a: { optimization_goal?: string }) => {
      const key = a?.optimization_goal || 'LINK_CLICKS';
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'LINK_CLICKS';
  };

  const buildReportRows = async () => {
    if (!reportFromDate || !reportToDate) {
      setReportError('Please select both from and to dates.');
      return;
    }

    const fromTs = getDateTs(reportFromDate);
    const toTs = getDateTs(reportToDate, true);
    if (Number.isNaN(fromTs) || Number.isNaN(toTs) || fromTs > toTs) {
      setReportError('Please select a valid date range.');
      return;
    }

    try {
      setReportLoading(true);
      setReportError('');
      setReportRows([]);

      const todayLabel = fmtDate(new Date().toISOString());

      const campaigns = await fetchCampaignsByIds(assignedCampaignIds);
      const filtered = campaigns.filter((c) => {
        const startTs = c.start_time ? new Date(c.start_time).getTime() : Number.NaN;
        if (Number.isNaN(startTs)) return false;
        return startTs >= fromTs && startTs <= toTs;
      });

      const rows = await Promise.all(
        filtered.map(async (campaign) => {
          const [goal, insightRes] = await Promise.all([
            getDominantGoalForCampaign(campaign.id),
            fetch(
              `/api/v1/meta/insights?type=single_campaign&campaign_id=${campaign.id}&since=${reportFromDate}&until=${reportToDate}`,
            ).then((r) => r.json()),
          ]);

          const parsed = parseCampaignInsight(insightRes?.data);
          const goalResult = resolveGoalResult(goal, parsed);

          return {
            date: todayLabel,
            adCreateDate: fmtDate(campaign.start_time || campaign.created_time),
            adEndDate: fmtDate(campaign.stop_time),
            campaignName: campaign.name || campaign.id,
            spendUsd: parsed.spend,
            spendTk: parsed.spend * USD_TO_TK_RATE,
            goal,
            goalResult: goalResult.value,
            costPerGoalResult: goalResult.costValue,
            reach: parsed.reach,
            impressions: parsed.impressions,
          } as ReportRow;
        }),
      );

      setReportRows(rows);
      setReportGeneratedAt(new Date().toISOString());
      setReportInvoiceNo(`RPT-${Date.now().toString().slice(-6)}`);
      if (rows.length === 0) {
        setReportError('No campaigns matched this date range.');
      }
    } catch (err: any) {
      setReportError(err?.message || 'Failed to build report.');
    } finally {
      setReportLoading(false);
    }
  };

  const downloadReportPdf = async () => {
    if (reportRows.length === 0 || !reportInvoiceRef.current) return;

    const [{ jsPDF }, html2canvasModule] = await Promise.all([
      import('jspdf'),
      import('html2canvas'),
    ]);
    const html2canvas = html2canvasModule.default;

    // ── Helper: rasterize SVG to PNG (html2canvas can’t render SVGs) ────
    const rasterizeSvg = (src: string, w: number, h: number): Promise<string> =>
      new Promise((resolve) => {
        fetch(src)
          .then((r) => r.text())
          .then((svgText) => {
            const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
              const c = document.createElement('canvas');
              c.width = w; c.height = h;
              c.getContext('2d')?.drawImage(img, 0, 0, w, h);
              URL.revokeObjectURL(url);
              resolve(c.toDataURL('image/png'));
            };
            img.onerror = () => { URL.revokeObjectURL(url); resolve(''); };
            img.src = url;
          })
          .catch(() => resolve(''));
      });

    const wrapper = reportInvoiceRef.current.parentElement as HTMLElement;
    const el = reportInvoiceRef.current;

    // ── Step 1: Move invoice ON-SCREEN so browser computes full layout ───
    // When elements are at top:-9999px, the browser skips full font metric
    // computation. html2canvas then reads wrong baselines → text at bottom.
    // Fix: temporarily show it on-screen (invisible to user via opacity:0).
    wrapper.style.position = 'fixed';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.zIndex = '-1';
    wrapper.style.opacity = '0';
    wrapper.style.pointerEvents = 'none';

    // ── Step 2: Wait for fonts + layout to be fully computed ─────────────
    await document.fonts.ready;
    // Double rAF ensures the browser has painted at least one frame
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

    // ── Step 3: Rasterize SVG images to PNG ──────────────────────────
    const images = Array.from(el.querySelectorAll('img'));
    const originalSrcs = images.map((img) => img.src);

    await Promise.all(
      images.map(async (img) => {
        try {
          const src = img.src;
          if (src.toLowerCase().includes('.svg') || src.startsWith('data:image/svg')) {
            const w = (img.offsetWidth || 230) * 2;
            const h = (img.offsetHeight || 40) * 2;
            const png = await rasterizeSvg(src, w, h);
            if (png) {
              img.src = png;
              await new Promise<void>((resolve) => {
                if (img.complete) { resolve(); return; }
                img.addEventListener('load', () => resolve(), { once: true });
                img.addEventListener('error', () => resolve(), { once: true });
              });
            }
          }
        } catch { /* skip */ }
      }),
    );

    // One more rAF after image swap to ensure paint
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    // ── Step 4: Capture with html2canvas ─────────────────────────────
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      imageTimeout: 0,
      backgroundColor: '#d9d9d9',
      logging: false,
    });

    // ── Step 5: Restore original state ───────────────────────────────
    images.forEach((img, i) => { img.src = originalSrcs[i]; });
    wrapper.style.position = 'absolute';
    wrapper.style.top = '-9999px';
    wrapper.style.left = '-9999px';
    wrapper.style.zIndex = '-1';
    wrapper.style.opacity = '';

    // ── Step 6: Build PDF ──────────────────────────────────────────
    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const renderWidth = pageWidth - margin * 2;
    const renderHeight = (canvas.height * renderWidth) / canvas.width;

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

    const fileName = `campaign-report-${reportFromDate}-to-${reportToDate}.pdf`;
    doc.save(fileName);
  };

  return (
    <AdminShell>
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-5">
          <h1 className="text-xl font-bold text-gray-900">My Campaigns</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage and monitor your campaigns and ads.
          </p>
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-2.5 sm:mt-4 sm:p-3">
            <div className="flex w-full min-w-0 items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search campaigns..."
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </div>

              <div className="relative w-36 shrink-0 sm:w-44">
                <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-7 text-xs text-gray-700 focus:ring-2 focus:ring-red-400 focus:outline-none"
                >
                  <option value="all">All statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="RECENTLY_COMPLETED">Recently Completed</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="NOT_DELIVERING">Not Delivering</option>
                  <option value="DELETED">Deleted</option>
                  <option value="ARCHIVED">Archived</option>
                  <option value="IN_PROCESS">In Review</option>
                  <option value="WITH_ISSUES">With Issues</option>
                </select>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-linear-to-b from-emerald-50 to-white px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm"
              >
                <Activity className="h-4 w-4" />
                {countsLoading ? 'Active ...' : `Active ${activeCampaignCount}`}
              </button>

              <button
                type="button"
                onClick={() => {
                  setReportOpen(true);
                  setReportError('');
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
              >
                <BarChart3 className="h-4 w-4 text-slate-500" />
                Report
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                aria-label="Refresh campaigns"
                title="Refresh campaigns"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 shadow-sm transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {countsLoading && <AdminSectionSkeleton variant="inline" />}

        <div>
          <CampaignsTable
            key={`my-campaigns-${refreshTick}`}
            searchValue={search}
            onSearchValueChange={setSearch}
            statusFilterValue={statusFilter}
            onStatusFilterChange={setStatusFilter}
            hideControls
            assignedCampaignIds={assignedCampaignIds}
            campaignAccountById={campaignAccountById}
          />
        </div>
      </div>

      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white p-4 shadow-2xl sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Campaign Report</h2>
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="rounded-md border border-gray-200 px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <p className="mt-1 text-sm text-gray-600">
              Select from and to date, then generate a report PDF in A4 format using your invoice design.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-gray-700">
                <span className="mb-1 block font-medium">From Date</span>
                <input
                  type="date"
                  value={reportFromDate}
                  onChange={(e) => setReportFromDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </label>
              <label className="text-sm text-gray-700">
                <span className="mb-1 block font-medium">To Date</span>
                <input
                  type="date"
                  value={reportToDate}
                  onChange={(e) => setReportToDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={buildReportRows}
                disabled={reportLoading}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reportLoading ? 'Generating...' : 'Generate Report'}
              </button>

              <button
                type="button"
                onClick={downloadReportPdf}
                disabled={reportRows.length === 0 || reportLoading}
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Download PDF (A4)
              </button>
            </div>

            {reportError && (
              <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {reportError}
              </p>
            )}

            {reportRows.length > 0 && (
              <div className="mt-4 max-h-72 overflow-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-7xl border-separate border-spacing-0 text-xs">
                  <thead className="sticky top-0 bg-gray-100">
                    <tr>
                      <th className="border-b border-gray-200 px-2 py-2 text-left">Date</th>
                      <th className="border-b border-gray-200 px-2 py-2 text-left">Ad Create Date</th>
                      <th className="border-b border-gray-200 px-2 py-2 text-left">Ad End Date</th>
                      <th className="border-b border-gray-200 px-2 py-2 text-left">Campaign Name</th>
                      <th className="border-b border-gray-200 px-2 py-2 text-right">Spend ($)</th>
                      <th className="border-b border-gray-200 px-2 py-2 text-right">Spend (Tk)</th>
                      <th className="border-b border-gray-200 px-2 py-2 text-left">Goal</th>
                      <th className="border-b border-gray-200 px-2 py-2 text-right">Goal Result</th>
                      <th className="border-b border-gray-200 px-2 py-2 text-right">Cost / Goal</th>
                      <th className="border-b border-gray-200 px-2 py-2 text-right">Reach</th>
                      <th className="border-b border-gray-200 px-2 py-2 text-right">Impressions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportRows.map((row, index) => (
                      <tr key={`${row.campaignName}-${index}`}>
                        <td className="border-b border-gray-100 px-2 py-2">{row.date}</td>
                        <td className="border-b border-gray-100 px-2 py-2">{row.adCreateDate}</td>
                        <td className="border-b border-gray-100 px-2 py-2">{row.adEndDate}</td>
                        <td className="border-b border-gray-100 px-2 py-2">{row.campaignName}</td>
                        <td className="border-b border-gray-100 px-2 py-2 text-right">{fmtCurrency(row.spendUsd)}</td>
                        <td className="border-b border-gray-100 px-2 py-2 text-right">{fmtTk(row.spendTk)}</td>
                        <td className="border-b border-gray-100 px-2 py-2">{row.goal}</td>
                        <td className="border-b border-gray-100 px-2 py-2 text-right">{row.goalResult}</td>
                        <td className="border-b border-gray-100 px-2 py-2 text-right">{fmtCurrency(row.costPerGoalResult)}</td>
                        <td className="border-b border-gray-100 px-2 py-2 text-right">{row.reach}</td>
                        <td className="border-b border-gray-100 px-2 py-2 text-right">{row.impressions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {reportRows.length > 0 && (
        // ── Off-screen invoice for PDF capture ──────────────────────────────
        // Use position:absolute (NOT fixed) so that height:100% on inner flex
        // divs resolves correctly against the element, not the viewport.
        // position:fixed causes html2canvas to miscompute child heights.
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-9999px',
            left: '-9999px',
            pointerEvents: 'none',
            zIndex: -1,
          }}
        >
          <div ref={reportInvoiceRef} style={{ width: 794 }}>
            <CampaignReportInvoice
              invoiceNo={reportInvoiceNo || `RPT-${Date.now().toString().slice(-6)}`}
              billDate={fmtDate(reportGeneratedAt || new Date().toISOString())}
              clientName={user?.fullName || user?.username || 'Assigned User'}
              assignBy={user?.fullName || user?.username || 'System'}
              rows={reportRows}
            />
          </div>
        </div>
      )}
    </AdminShell>
  );
}
