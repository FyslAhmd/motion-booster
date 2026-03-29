'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, X, Loader2, CalendarDays } from 'lucide-react';
import AssignUserDropdown from './AssignUserDropdown';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  effective_status: string;
  configured_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  spend_cap?: string;
  start_time?: string;
  stop_time?: string;
  created_time: string;
  updated_time?: string;
  ads?: { data: Array<{ creative?: { thumbnail_url?: string } }> };
  /** Computed by backend via deriveDeliveryStatus — always present in API response */
  derived_status?: { label: string; key: string };
}

interface CampaignAdSet {
  id: string;
  name: string;
  status: string;
  effective_status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  optimization_goal?: string;
  start_time?: string;
  end_time?: string;
  created_time: string;
  targeting?: any;
  derived_status?: { label: string; key: string };
}

interface CampaignAd {
  id: string;
  name: string;
  status: string;
  effective_status: string;
  adset_id: string;
  campaign_id?: string;
  created_time: string;
  creative?: {
    id?: string;
    name?: string;
    thumbnail_url?: string;
    body?: string;
    title?: string;
  };
  derived_status?: { label: string; key: string };
}

interface CursorPaging {
  cursors?: { before?: string; after?: string };
  hasNext?: boolean;
  hasPrevious?: boolean;
}

interface CampaignCardMetric {
  spend: number;
  metricLabel: string;
  metricValue: number;
  costLabel: string;
  costValue: number;
}

function parseCampaignInsights(insight: any) {
  if (!insight) return null;
  const actions = insight.actions || [];
  const costs = insight.cost_per_action_type || [];

  const getAction = (type: string) =>
    Number(actions.find((a: any) => a.action_type === type)?.value || 0);
  const getCost = (type: string) =>
    Number(costs.find((a: any) => a.action_type === type)?.value || 0);

  return {
    spend: Number(insight.spend || 0),
    reach: Number(insight.reach || 0),
    impressions: Number(insight.impressions || 0),
    cpc: Number(insight.cpc || 0),
    ctr: Number(insight.ctr || 0),
    getAction,
    getCost,
  };
}

const GOAL_TO_DYNAMIC_METRIC: Record<string, { metricLabel: string; costLabel: string; actionTypes: string[] }> = {
  CONVERSATIONS: {
    metricLabel: 'Message',
    costLabel: 'Cost / Message',
    actionTypes: [
      'onsite_conversion.total_messaging_connection',
      'onsite_conversion.messaging_conversation_started_7d',
    ],
  },
  MESSAGING_PURCHASE_CONVERSION: {
    metricLabel: 'Message',
    costLabel: 'Cost / Message',
    actionTypes: [
      'onsite_conversion.messaging_conversation_started_7d',
      'onsite_conversion.total_messaging_connection',
    ],
  },
  PAGE_LIKES: {
    metricLabel: 'Page Likes',
    costLabel: 'Cost / Like',
    actionTypes: ['like'],
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
    metricLabel: 'Landing Page Views',
    costLabel: 'Cost / LPV',
    actionTypes: ['landing_page_view', 'link_click'],
  },
  OFFSITE_CONVERSIONS: {
    metricLabel: 'Purchases',
    costLabel: 'Cost / Purchase',
    actionTypes: ['purchase', 'onsite_web_purchase'],
  },
  POST_ENGAGEMENT: {
    metricLabel: 'Post Engagement',
    costLabel: 'Cost / Engagement',
    actionTypes: ['post_engagement', 'page_engagement'],
  },
  THRUPLAY: {
    metricLabel: 'Video Views',
    costLabel: 'Cost / View',
    actionTypes: ['video_view', 'thruplay'],
  },
  QUALITY_CALL: {
    metricLabel: 'Calls',
    costLabel: 'Cost / Call',
    actionTypes: [
      'onsite_conversion.messaging_user_call_placed',
      'onsite_conversion.messaging_60s_call_connect',
      'onsite_conversion.messaging_20s_call_connect',
    ],
  },
  REACH: {
    metricLabel: 'Reach Results',
    costLabel: 'Cost / Reach',
    actionTypes: ['reach'],
  },
};

function getDominantOptimizationGoal(adSets: CampaignAdSet[]): string | undefined {
  if (!adSets.length) return undefined;
  const countMap = new Map<string, number>();
  for (const adSet of adSets) {
    const key = adSet.optimization_goal || 'UNKNOWN';
    countMap.set(key, (countMap.get(key) || 0) + 1);
  }
  return [...countMap.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

function resolveDynamicInsightMetric(
  data: ReturnType<typeof parseCampaignInsights>,
  optimizationGoal?: string,
) {
  if (!data) return null;

  const goal = optimizationGoal || 'LINK_CLICKS';
  const config = GOAL_TO_DYNAMIC_METRIC[goal] || GOAL_TO_DYNAMIC_METRIC.LINK_CLICKS;

  if (goal === 'REACH') {
    return {
      goal,
      metricLabel: config.metricLabel,
      costLabel: config.costLabel,
      metricValue: data.reach,
      costValue: data.reach > 0 ? data.spend / data.reach : 0,
    };
  }

  let metricValue = 0;
  let costValue = 0;
  for (const actionType of config.actionTypes) {
    const value = data.getAction(actionType);
    if (value > 0) {
      metricValue = value;
      costValue = data.getCost(actionType);
      break;
    }
  }

  // Fallback: first mapped action, even if zero.
  if (metricValue === 0 && config.actionTypes.length > 0) {
    metricValue = data.getAction(config.actionTypes[0]);
    costValue = data.getCost(config.actionTypes[0]);
  }

  return {
    goal,
    metricLabel: config.metricLabel,
    costLabel: config.costLabel,
    metricValue,
    costValue,
  };
}

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:               'bg-green-50 text-green-700 border border-green-200',
  SCHEDULED:            'bg-blue-50 text-blue-700 border border-blue-200',
  IN_REVIEW:            'bg-yellow-50 text-yellow-700 border border-yellow-200',
  COMPLETED:            'bg-indigo-50 text-indigo-600 border border-indigo-200',
  RECENTLY_COMPLETED:   'bg-indigo-50 text-indigo-600 border border-indigo-200',
  PAUSED:               'bg-amber-50 text-amber-700 border border-amber-200',
  NOT_DELIVERING:       'bg-orange-50 text-orange-600 border border-orange-200',
  WITH_ISSUES:          'bg-orange-50 text-orange-600 border border-orange-200',
  NOT_APPROVED:         'bg-red-50 text-red-600 border border-red-200',
  DISAPPROVED:          'bg-red-50 text-red-600 border border-red-200',
  PENDING_REVIEW:       'bg-yellow-50 text-yellow-700 border border-yellow-200',
  PENDING_BILLING_INFO: 'bg-orange-50 text-orange-600 border border-orange-200',
  PREAPPROVED:          'bg-blue-50 text-blue-600 border border-blue-200',
  CAMPAIGN_PAUSED:      'bg-amber-50 text-amber-600 border border-amber-200',
  ADSET_PAUSED:         'bg-amber-50 text-amber-600 border border-amber-200',
  DELETED:              'bg-red-50 text-red-600 border border-red-200',
  ARCHIVED:             'bg-gray-100 text-gray-500 border border-gray-200',
  ERROR:                'bg-red-50 text-red-500 border border-red-200',
  UNKNOWN:              'bg-gray-100 text-gray-500',
};

function fmtBudget(val?: string) {
  if (!val) return '—';
  return `$${(parseInt(val, 10) / 100).toFixed(2)}`;
}

function fmtDate(val?: string) {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function summarizeTargeting(t: any): string {
  if (!t) return '—';
  const parts: string[] = [];
  if (Array.isArray(t.age_range) && t.age_range.length >= 2) {
    const [minAge, maxAge] = t.age_range;
    parts.push(`Age ${minAge || '?'}-${maxAge || '?'}`);
  } else if (t.age_min || t.age_max) {
    parts.push(`Age ${t.age_min || '?'}-${t.age_max || '?'}`);
  }
  if (t.genders?.length) {
    parts.push(t.genders.map((v: number) => (v === 1 ? 'M' : v === 2 ? 'F' : 'All')).join(', '));
  }
  if (t.interests?.length) parts.push(`${t.interests.length} interest(s)`);

  const locationLine = t.geo_locations?.countries?.length
    ? `Location: ${t.geo_locations.countries.join(', ')}`
    : '';

  if (!parts.length && !locationLine) return '—';
  if (!locationLine) return parts.join(' • ');
  if (!parts.length) return locationLine;
  return `${parts.join(' • ')}\n${locationLine}`;
}

interface CampaignsTableProps {
  accountId?: string;
}

interface AssignmentUser {
  id: string;
  fullName: string;
  phone: string;
  username: string;
}

const PAGE_SIZE = 9;

export default function CampaignsTable({ accountId }: CampaignsTableProps) {
  const [data, setData] = useState<Campaign[]>([]);
  const [paging, setPaging] = useState<CursorPaging | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [cursorStack, setCursorStack] = useState<string[]>([]);  // stack of "after" cursors for prev navigation
  const [currentAfter, setCurrentAfter] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignAdSets, setCampaignAdSets] = useState<CampaignAdSet[]>([]);
  const [campaignAdsByAdSet, setCampaignAdsByAdSet] = useState<Record<string, CampaignAd[]>>({});
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [insightDatePreset, setInsightDatePreset] = useState('maximum');
  const [customSince, setCustomSince] = useState('');
  const [customUntil, setCustomUntil] = useState('');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [campaignInsights, setCampaignInsights] = useState<any>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState('');
  const [campaignCardMetrics, setCampaignCardMetrics] = useState<Record<string, CampaignCardMetric>>({});
  const [mounted, setMounted] = useState(false);
  const customSinceRef = useRef<HTMLInputElement>(null);

  // Assignment tracking: metaObjectId → users[]
  const [assignments, setAssignments] = useState<Record<string, AssignmentUser[]>>({});

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const statusMeta = useCallback((key?: string, fallbackLabel?: string) => {
    const normalized = key || 'UNKNOWN';
    const color = STATUS_STYLES[normalized] || STATUS_STYLES.UNKNOWN;
    const label = fallbackLabel || normalized.replace(/_/g, ' ');
    return { color, label };
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(searchTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const doFetch = async () => {
      setLoading(true);
      setError('');
      try {
        const p = new URLSearchParams({ limit: String(PAGE_SIZE) });
        if (accountId) p.set('account_id', accountId);
        if (search) p.set('search', search);
        if (currentAfter) p.set('after', currentAfter);
        if (filterStatus !== 'all') p.set('status', filterStatus);

        const res = await fetch(`/api/v1/meta/campaigns?${p}`, { signal: controller.signal });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
          setPaging(json.paging || null);
          if (json.totalCount != null) setTotalCount(json.totalCount);
        } else {
          setError(json.error || 'Failed to load');
        }
      } catch (e: any) {
        if (e.name !== 'AbortError') setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    doFetch();
    return () => controller.abort();
  }, [currentAfter, search, filterStatus, accountId]);

  // Fetch assignments for current page of campaigns
  useEffect(() => {
    if (data.length === 0 || !accountId) return;
    const ids = data.map((c) => c.id).join(',');
    fetch(`/api/v1/admin/meta-assignments?account_id=${accountId}&type=CAMPAIGN&object_ids=${ids}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const map: Record<string, AssignmentUser[]> = {};
          for (const a of json.data) {
            if (!map[a.metaObjectId]) map[a.metaObjectId] = [];
            map[a.metaObjectId].push(a.user);
          }
          setAssignments(map);
        }
      })
      .catch(() => {});
  }, [data, accountId]);

  // Fetch spend + dynamic metric cards for currently visible campaigns
  useEffect(() => {
    if (!data.length) {
      setCampaignCardMetrics({});
      return;
    }

    let isCancelled = false;

    const loadCardMetrics = async () => {
      const entries = await Promise.all(
        data.map(async (campaign) => {
          try {
            const insightQuery = new URLSearchParams({
              type: 'single_campaign',
              campaign_id: campaign.id,
              date_preset: 'maximum',
            });
            const adsetQuery = new URLSearchParams({
              campaign_id: campaign.id,
              limit: '100',
            });
            if (accountId) {
              insightQuery.set('account_id', accountId);
              adsetQuery.set('account_id', accountId);
            }

            const [insightRes, adsetRes] = await Promise.all([
              fetch(`/api/v1/meta/insights?${insightQuery}`),
              fetch(`/api/v1/meta/adsets?${adsetQuery}`),
            ]);

            const [insightJson, adsetJson] = await Promise.all([
              insightRes.json(),
              adsetRes.json(),
            ]);

            const insight = insightJson?.success
              ? Array.isArray(insightJson.data) && insightJson.data.length > 0
                ? insightJson.data[0]
                : insightJson.data?.data?.[0]
              : null;

            const parsed = parseCampaignInsights(insight);
            if (!parsed) return [campaign.id, null] as const;

            const adSets = (adsetJson?.success ? adsetJson.data : []) as CampaignAdSet[];
            const dominantGoal = getDominantOptimizationGoal(adSets);
            const dynamicMetric = resolveDynamicInsightMetric(parsed, dominantGoal);

            if (!dynamicMetric) return [campaign.id, null] as const;

            return [
              campaign.id,
              {
                spend: parsed.spend,
                metricLabel: dynamicMetric.metricLabel,
                metricValue: dynamicMetric.metricValue,
                costLabel: dynamicMetric.costLabel,
                costValue: dynamicMetric.costValue,
              } satisfies CampaignCardMetric,
            ] as const;
          } catch {
            return [campaign.id, null] as const;
          }
        }),
      );

      if (isCancelled) return;

      const next: Record<string, CampaignCardMetric> = {};
      for (const [campaignId, metric] of entries) {
        if (metric) next[campaignId] = metric;
      }
      setCampaignCardMetrics(next);
    };

    loadCardMetrics();

    return () => {
      isCancelled = true;
    };
  }, [data, accountId]);

  const goNext = () => {
    if (paging?.cursors?.after && paging.hasNext) {
      setCursorStack((prev) => [...prev, currentAfter || '__first__']);
      setCurrentAfter(paging.cursors.after);
      setPageNum((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (cursorStack.length > 0) {
      const stack = [...cursorStack];
      const prev = stack.pop()!;
      setCursorStack(stack);
      setCurrentAfter(prev === '__first__' ? undefined : prev);
      setPageNum((p) => Math.max(1, p - 1));
    }
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setCurrentAfter(undefined);
    setCursorStack([]);
    setPageNum(1);
  };

  const handleStatusFilter = (val: string) => {
    setFilterStatus(val);
    setCurrentAfter(undefined);
    setCursorStack([]);
    setPageNum(1);
  };

  // Reset pagination when account changes
  useEffect(() => {
    setCurrentAfter(undefined);
    setCursorStack([]);
    setPageNum(1);
    setSearch('');
    setFilterStatus('ACTIVE');
  }, [accountId]);

  const hasNext = !!paging?.hasNext;
  const hasPrev = cursorStack.length > 0;
  const totalPages = totalCount != null ? Math.ceil(totalCount / PAGE_SIZE) : null;

  const campaignBudgetLabel = (c: Campaign) =>
    c.daily_budget ? `${fmtBudget(c.daily_budget)}/day` : c.lifetime_budget ? `${fmtBudget(c.lifetime_budget)} lifetime` : '—';

  const campaignDateRangeLabel = (c: Campaign) =>
    `${fmtDate(c.start_time)}${c.stop_time ? ` → ${fmtDate(c.stop_time)}` : ' → Ongoing'}`;

  /** Toggle campaign status between ACTIVE and PAUSED */
  const toggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setTogglingId(campaign.id);
    try {
      const res = await fetch('/api/v1/meta/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaign.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        // Optimistically update the local row
        setData((prev) =>
          prev.map((c) =>
            c.id === campaign.id
              ? {
                  ...c,
                  status: newStatus,
                  effective_status: newStatus,
                  configured_status: newStatus,
                  derived_status: {
                    key: newStatus,
                    label: newStatus === 'ACTIVE' ? 'Active' : 'Paused',
                  },
                }
              : c,
          ),
        );
      } else {
        toast.error(`Failed: ${json.error}`);
      }
    } catch (e: any) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  /** Can this campaign be toggled? */
  const canToggle = (c: Campaign) =>
    ['ACTIVE', 'PAUSED'].includes(c.status) &&
    !['DELETED', 'ARCHIVED'].includes(c.effective_status);

  const canToggleMetaObject = (status: string, effectiveStatus: string) =>
    ['ACTIVE', 'PAUSED'].includes(status) &&
    !['DELETED', 'ARCHIVED'].includes(effectiveStatus);

  const toggleMetaObjectStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setTogglingId(id);
    try {
      const res = await fetch('/api/v1/meta/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (!json.success) {
        toast.error(`Failed: ${json.error}`);
        return;
      }

      // Update ad sets in modal
      setCampaignAdSets((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: newStatus, effective_status: newStatus }
            : a,
        ),
      );

      // Update ads in modal
      setCampaignAdsByAdSet((prev) => {
        const next: Record<string, CampaignAd[]> = {};
        for (const [adSetId, ads] of Object.entries(prev)) {
          next[adSetId] = ads.map((ad) =>
            ad.id === id
              ? { ...ad, status: newStatus, effective_status: newStatus }
              : ad,
          );
        }
        return next;
      });
    } catch (e: any) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  const closeCampaignModal = useCallback(() => {
    setSelectedCampaign(null);
    setCampaignAdSets([]);
    setCampaignAdsByAdSet({});
    setModalLoading(false);
    setModalError('');
    setCampaignInsights(null);
    setInsightsError('');
    setInsightDatePreset('maximum');
    setCustomSince('');
    setCustomUntil('');
    setShowCustomRange(false);
  }, []);

  const fetchInsights = async (campaignId: string, preset: string, options?: { since?: string; until?: string }) => {
    setInsightsLoading(true);
    setInsightsError('');
    try {
      const params = new URLSearchParams({
        type: 'single_campaign',
        campaign_id: campaignId,
        date_preset: preset,
      });
      if (options?.since && options?.until) {
        params.set('since', options.since);
        params.set('until', options.until);
      }

      const res = await fetch(`/api/v1/meta/insights?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setCampaignInsights(json.data[0]);
      } else if (json.success && json.data?.data?.length > 0) {
        setCampaignInsights(json.data.data[0]);
      } else {
        setCampaignInsights(null); // No data for this timeframe
      }
    } catch (e: any) {
      setInsightsError('Failed to load insights.');
    } finally {
      setInsightsLoading(false);
    }
  };

  const openCampaignModal = useCallback(async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setCampaignAdSets([]);
    setCampaignAdsByAdSet({});
    setModalError('');
    setModalLoading(true);
    setInsightDatePreset('maximum');

    // Fetch initial insights using default preset
    fetchInsights(campaign.id, 'maximum');

    try {
      const adSetQuery = new URLSearchParams({ campaign_id: campaign.id, limit: '12' });
      if (accountId) adSetQuery.set('account_id', accountId);
      const adSetRes = await fetch(`/api/v1/meta/adsets?${adSetQuery}`);
      const adSetJson = await adSetRes.json();

      if (!adSetJson.success) {
        throw new Error(adSetJson.error || 'Failed to load ad sets');
      }

      const adSets = (adSetJson.data || []) as CampaignAdSet[];
      setCampaignAdSets(adSets);

      if (adSets.length > 0) {
        const adFetches = adSets.map(async (adSet) => {
          const adsQuery = new URLSearchParams({ adset_id: adSet.id, limit: '6' });
          if (accountId) adsQuery.set('account_id', accountId);
          const adsRes = await fetch(`/api/v1/meta/ads?${adsQuery}`);
          const adsJson = await adsRes.json();
          return {
            adSetId: adSet.id,
            ads: (adsJson.success ? adsJson.data : []) as CampaignAd[],
          };
        });

        const adsResults = await Promise.allSettled(adFetches);
        const nextMap: Record<string, CampaignAd[]> = {};
        adsResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            nextMap[result.value.adSetId] = result.value.ads;
          }
        });
        setCampaignAdsByAdSet(nextMap);
      }
    } catch (e: any) {
      setModalError(e?.message || 'Failed to load campaign details');
    } finally {
      setModalLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (!selectedCampaign) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCampaignModal();
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedCampaign, closeCampaignModal]);

  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      {/* Controls */}
      <div className="flex flex-col gap-3 border-b border-gray-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <h3 className="text-sm font-semibold text-gray-700">
          Campaigns {pageNum > 1 && <span className="ml-1 text-xs text-gray-500">Page {pageNum}{totalPages ? `/${totalPages}` : ''}</span>}
        </h3>
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                const val = e.target.value;
                setSearch(val);
                clearTimeout(searchTimerRef.current);
                searchTimerRef.current = setTimeout(() => handleSearch(val), 400);
              }}
              placeholder="Search campaigns..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-400 focus:outline-none sm:w-52"
            />
          </div>
          <div className="relative shrink-0">
            <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-7 text-xs text-gray-700 focus:ring-2 focus:ring-red-400 focus:outline-none"
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
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-3 p-3 sm:gap-4 sm:p-5 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`campaign-skeleton-${i}`} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="skeleton-breathe h-12 w-12 shrink-0 rounded-lg bg-gray-200/80" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="skeleton-breathe h-4 w-5/6 rounded-lg bg-gray-200/80" />
                  <div className="flex items-center gap-2">
                    <div className="skeleton-breathe h-5 w-16 rounded-full bg-gray-200/80" />
                    <div className="skeleton-breathe h-3 w-24 rounded-lg bg-gray-200/80" />
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <div className="skeleton-breathe h-3.5 w-2/3 rounded-lg bg-gray-200/80" />
                <div className="skeleton-breathe h-3.5 w-5/6 rounded-lg bg-gray-200/80" />
                <div className="skeleton-breathe h-3.5 w-1/2 rounded-lg bg-gray-200/80" />
              </div>
              <div className="mt-4 border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="skeleton-breathe h-7 w-24 rounded-full bg-gray-200/80" />
                  <div className="skeleton-breathe h-5 w-10 rounded-full bg-gray-200/80" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="px-3 py-8 text-center text-sm text-red-400 sm:px-6 sm:py-10">{error}</div>
      )}

      {/* Cards */}
      {!loading && !error && (
        <>
          {data.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-gray-500 sm:px-6 sm:py-10">No campaigns found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 p-3 sm:gap-4 sm:p-5 lg:grid-cols-3">
	              {data.map((c) => {
	                const derived = c.derived_status || { label: c.effective_status?.replace(/_/g, ' ') || 'Unknown', key: c.effective_status || 'UNKNOWN' };
	                const { color, label } = statusMeta(derived.key, derived.label);
	                const thumb = c.ads?.data?.[0]?.creative?.thumbnail_url;
                  const isActiveCampaign = derived.key === 'ACTIVE';
                  const cardMetric = campaignCardMetrics[c.id];
	                const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
	                  const target = e.target as HTMLElement;
	                  if (target.closest('[data-no-modal="true"]')) return;
	                  openCampaignModal(c);
	                };
	                return (
	                  <div
	                    key={c.id}
	                    onClick={handleCardClick}
	                    className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
	                    role="button"
	                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openCampaignModal(c);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        {thumb ? (
                          <img src={thumb} alt={c.name} className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">N/A</div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${
                            isActiveCampaign ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          title={isActiveCampaign ? 'Active' : 'Inactive'}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{c.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>{label}</span>
                          <span className="text-xs text-gray-500">{c.objective?.replace(/_/g, ' ') || '—'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                                              <div className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5">
                        <p className="truncate text-[10px] uppercase tracking-wide text-gray-500" title={cardMetric?.metricLabel || 'Metric'}>
                          {cardMetric?.metricLabel || 'Metric'}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-gray-900">
                          {cardMetric ? cardMetric.metricValue.toLocaleString() : '—'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5">
                        <p className="truncate text-[10px] uppercase tracking-wide text-gray-500" title={cardMetric?.costLabel || 'Cost'}>
                          {cardMetric?.costLabel || 'Cost'}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-gray-900">
                          {cardMetric ? (cardMetric.costValue > 0 ? `$${cardMetric.costValue.toFixed(4)}` : '—') : '—'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5">
                        <p className="text-[10px] uppercase tracking-wide text-gray-500">Spend</p>
                        <p className="mt-0.5 text-xs font-semibold text-gray-900">
                          {cardMetric ? `$${cardMetric.spend.toFixed(2)}` : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                      <p>Budget: <span className="font-medium text-gray-800">{campaignBudgetLabel(c)}</span></p>
                      <p>Date Range: <span className="font-medium text-gray-800">{campaignDateRangeLabel(c)}</span></p>
                    </div>

	                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
	                      <div className="min-w-45 flex-1" data-no-modal="true">
	                        {accountId ? (
	                          <AssignUserDropdown
	                            metaObjectId={c.id}
                            metaObjectType="CAMPAIGN"
                            metaAccountId={accountId}
                            assignedUsers={assignments[c.id] || []}
                            allowMultiple
                            onAssigned={(users) => setAssignments((prev) => ({ ...prev, [c.id]: users }))}
                          />
	                        ) : (
	                          <span className="text-xs text-gray-400">No account selected</span>
	                        )}
	                      </div>
	                      <div className="flex items-center gap-2" data-no-modal="true">
	                        <span className="text-xs font-medium text-gray-500">Active</span>
	                        {canToggle(c) ? (
	                          <button
	                            onClick={() => toggleStatus(c)}
	                            disabled={togglingId === c.id}
	                            data-no-modal="true"
	                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 ${
                                isActiveCampaign ? 'bg-green-500' : 'bg-gray-300'
	                            } ${togglingId === c.id ? 'opacity-50' : ''}`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                  isActiveCampaign ? 'translate-x-4' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {(hasNext || hasPrev) && (
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
              <p className="text-xs text-gray-500">Page {pageNum}{totalPages ? ` / ${totalPages}` : ''}</p>
              <div className="flex items-center gap-1">
                <button onClick={goPrev} disabled={!hasPrev} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-8 rounded-lg bg-red-600 px-2 py-1 text-center text-xs font-medium text-white">{pageNum}{totalPages ? `/${totalPages}` : ''}</span>
                <button onClick={goNext} disabled={!hasNext} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {mounted && selectedCampaign && createPortal(
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/55 p-3 sm:p-4"
          onClick={closeCampaignModal}
        >
          <div
            className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
              <h3 className="text-sm font-semibold text-gray-900 sm:text-base">Campaign Details</h3>
              <button
                type="button"
                onClick={closeCampaignModal}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="no-scrollbar max-h-[calc(80vh-56px)] space-y-4 overflow-y-auto p-4 sm:p-5">
              {(() => {
                const derived = selectedCampaign.derived_status || {
                  label: selectedCampaign.effective_status?.replace(/_/g, ' ') || 'Unknown',
                  key: selectedCampaign.effective_status || 'UNKNOWN',
                };
                const { color, label } = statusMeta(derived.key, derived.label);
                const thumb = selectedCampaign.ads?.data?.[0]?.creative?.thumbnail_url;
                const isActiveCampaign = derived.key === 'ACTIVE';
                return (
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={selectedCampaign.name}
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                            N/A
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white shadow-sm ${
                            isActiveCampaign ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          title={isActiveCampaign ? 'Active' : 'Inactive'}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                          {selectedCampaign.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
                            {label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {selectedCampaign.objective?.replace(/_/g, ' ') || '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                      <p>Budget: <span className="font-medium text-gray-800">{campaignBudgetLabel(selectedCampaign)}</span></p>
                      <p>Date Range: <span className="font-medium text-gray-800">{campaignDateRangeLabel(selectedCampaign)}</span></p>
                      {/* <p>Created: <span className="font-medium text-gray-800">{fmtDate(selectedCampaign.created_time)}</span></p> */}
                    </div>
                  </div>
                );
              })()}

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <h4 className="text-sm font-semibold text-gray-900">Campaign Insights</h4>
                  <div className="grid w-full grid-cols-5 gap-1 rounded-lg bg-gray-100 p-1">
                    {[
                      { value: 'today', label: 'Today' },
                      { value: 'last_7d', label: '7 Days' },
                      { value: 'last_30d', label: '30 Days' },
                      { value: 'maximum', label: 'Max' },
                      { value: 'custom', label: 'Custom' },
                    ].map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => {
                          if (tab.value === 'custom') {
                            setInsightDatePreset('custom');
                            setShowCustomRange(true);
                            requestAnimationFrame(() => {
                              if (customSinceRef.current) {
                                const picker = customSinceRef.current as HTMLInputElement & { showPicker?: () => void };
                                if (typeof picker.showPicker === 'function') picker.showPicker();
                                else picker.focus();
                              }
                            });
                            return;
                          }
                          setShowCustomRange(false);
                          setInsightDatePreset(tab.value);
                          fetchInsights(selectedCampaign.id, tab.value);
                        }}
                        className={`w-full min-w-0 rounded-md px-1.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition-colors sm:px-3 sm:text-xs ${
                          insightDatePreset === tab.value
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        aria-label={tab.value === 'custom' ? 'Custom date range' : tab.label}
                      >
                        {tab.value === 'custom' ? (
                          <span className="flex items-center justify-center">
                            <CalendarDays className="h-4 w-4 text-black" />
                          </span>
                        ) : (
                          tab.label
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {showCustomRange && (
                  <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <label className="text-xs font-medium text-gray-600">
                        From
                        <input
                          ref={customSinceRef}
                          type="date"
                          value={customSince}
                          onChange={(e) => setCustomSince(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                      </label>
                      <label className="text-xs font-medium text-gray-600">
                        To
                        <input
                          type="date"
                          value={customUntil}
                          onChange={(e) => setCustomUntil(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                        />
                      </label>
                    </div>
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomRange(false);
                          setInsightDatePreset('maximum');
                        }}
                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!customSince || !customUntil}
                        onClick={() => {
                          if (!customSince || !customUntil) return;
                          if (customSince > customUntil) {
                            toast.error('From date cannot be after To date.');
                            return;
                          }
                          fetchInsights(selectedCampaign.id, 'custom', { since: customSince, until: customUntil });
                        }}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}

                {insightsLoading ? (
                  <div className="flex items-center justify-center py-6 text-sm text-gray-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading insights...
                  </div>
                ) : insightsError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
                    {insightsError}
                  </div>
                ) : !campaignInsights ? (
                  <div className="rounded-lg border border-dashed border-gray-300 py-6 text-center text-xs text-gray-500">
                    No insights data for this timeframe.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(() => {
                      const data = parseCampaignInsights(campaignInsights);
                      if (!data) return null;
                      const dominantGoal = getDominantOptimizationGoal(campaignAdSets);
                      const dynamicMetric = resolveDynamicInsightMetric(data, dominantGoal);
                      return (
                        <>
                        {dynamicMetric && (
                            <>
                              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">{dynamicMetric.metricLabel}</p>
                                <p className="mt-1 text-lg font-bold text-gray-900">{dynamicMetric.metricValue.toLocaleString()}</p>
                                {/* <p className="mt-0.5 text-[10px] text-gray-400">Goal: {dynamicMetric.goal?.replace(/_/g, ' ') || '—'}</p> */}
                              </div>
                              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                <p
                                  className="truncate text-[11px] font-medium uppercase tracking-wider text-gray-500"
                                  title={dynamicMetric.costLabel}
                                >
                                  {dynamicMetric.costLabel}
                                </p>
                                <p className="mt-1 text-lg font-bold text-gray-900">
                                  {dynamicMetric.costValue > 0 ? `$${dynamicMetric.costValue.toFixed(4)}` : '—'}
                                </p>
                              </div>
                            </>
                          )}
                          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Spend</p>
                            <p className="mt-1 text-lg font-bold text-gray-900">${data.spend.toFixed(2)}</p>
                          </div>
                          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Reach</p>
                            <p className="mt-1 text-lg font-bold text-gray-900">{data.reach.toLocaleString()}</p>
                          </div>
                          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Impressions</p>
                            <p className="mt-1 text-lg font-bold text-gray-900">{data.impressions.toLocaleString()}</p>
                          </div>

                          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">CTR</p>
                            <p className="mt-1 text-lg font-bold text-gray-900">{data.ctr.toFixed(2)}%</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-linear-to-b from-white to-gray-50 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Ad Sets & Ads</h4>
                    <p className="mt-0.5 text-xs text-gray-500">
                      All ad sets under this campaign and their ads
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600">
                      {campaignAdSets.length} Ad Sets
                    </span>
                    <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-600">
                      {campaignAdSets.reduce((sum, s) => sum + (campaignAdsByAdSet[s.id]?.length || 0), 0)} Ads
                    </span>
                  </div>
                </div>

                {modalLoading ? (
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                    Loading ad sets and ads...
                  </div>
                ) : modalError ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {modalError}
                  </div>
                ) : campaignAdSets.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white px-3 py-4 text-center text-xs text-gray-500">
                    No ad sets found under this campaign.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {campaignAdSets.map((adSet) => {
                      const adSetStatus = statusMeta(adSet.derived_status?.key || adSet.effective_status, adSet.derived_status?.label);
                      const adList = campaignAdsByAdSet[adSet.id] || [];
                      return (
                        <div key={adSet.id} className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900">{adSet.name}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${adSetStatus.color}`}>
                              {adSetStatus.label}
                            </span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                              {adList.length} Ads
                            </span>
                            {canToggleMetaObject(adSet.status, adSet.effective_status) && (
                              <button
                                onClick={() => toggleMetaObjectStatus(adSet.id, adSet.status)}
                                disabled={togglingId === adSet.id}
                                className={`relative ml-auto inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 ${
                                  adSet.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                                } ${togglingId === adSet.id ? 'opacity-50' : ''}`}
                                title={adSet.status === 'ACTIVE' ? 'Pause Ad Set' : 'Activate Ad Set'}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                    adSet.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-gray-500">Budget</p>
                              <p className="mt-0.5 text-xs font-medium text-gray-700">
                                {adSet.daily_budget ? `${fmtBudget(adSet.daily_budget)}/day` : adSet.lifetime_budget ? `${fmtBudget(adSet.lifetime_budget)} lifetime` : '—'}
                              </p>
                              <p className="mt-0.5 text-[11px] text-gray-500">Remaining: {fmtBudget(adSet.budget_remaining)}</p>
                            </div>
                            <div className="rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-2">
                              <p className="text-[10px] uppercase tracking-wide text-gray-500">Schedule</p>
                              <p className="mt-0.5 text-xs font-medium text-gray-700">
                                {`${fmtDate(adSet.start_time)}${adSet.end_time ? ` → ${fmtDate(adSet.end_time)}` : ' → Ongoing'}`}
                              </p>
                              <p className="mt-0.5 text-[11px] text-gray-500">Created: {fmtDate(adSet.created_time)}</p>
                            </div>
                          </div>
                          <div className="mt-2 rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-2">
                            <p className="text-[10px] uppercase tracking-wide text-gray-500">Optimization</p>
                            <p className="mt-0.5 text-xs font-medium text-gray-700">{adSet.optimization_goal?.replace(/_/g, ' ') || '—'}</p>
                            <p className="mt-1 whitespace-pre-line text-[11px] text-gray-500">Targeting: {summarizeTargeting(adSet.targeting)}</p>
                          </div>

                          {adList.length > 0 ? (
                            <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                              {adList.map((ad) => {
                                const adStatus = statusMeta(ad.derived_status?.key || ad.effective_status, ad.derived_status?.label);
                                return (
                                  <div key={ad.id} className="rounded-lg border border-gray-100 bg-white px-2.5 py-2.5">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex min-w-0 flex-1 items-center gap-2">
                                        {ad.creative?.thumbnail_url ? (
                                          <img
                                            src={ad.creative.thumbnail_url}
                                            alt={ad.name}
                                            className="h-9 w-9 rounded-md object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-200 text-[10px] text-gray-500">
                                            N/A
                                          </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-xs font-semibold text-gray-800">{ad.name}</p>
                                          <p className="truncate text-[11px] text-gray-500">ID: {ad.id}</p>
                                        </div>
                                      </div>
                                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${adStatus.color}`}>
                                        {adStatus.label}
                                      </span>
                                      {canToggleMetaObject(ad.status, ad.effective_status) && (
                                        <button
                                          onClick={() => toggleMetaObjectStatus(ad.id, ad.status)}
                                          disabled={togglingId === ad.id}
                                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 ${
                                            ad.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                                          } ${togglingId === ad.id ? 'opacity-50' : ''}`}
                                          title={ad.status === 'ACTIVE' ? 'Pause Ad' : 'Activate Ad'}
                                        >
                                          <span
                                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                              ad.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-1'
                                            }`}
                                          />
                                        </button>
                                      )}
                                    </div>
                                    <p className="mt-1.5 truncate text-[11px] text-gray-600">
                                      Title: {ad.creative?.title || '—'}
                                    </p>
                                    <p className="mt-0.5 line-clamp-2 text-[11px] text-gray-500">
                                      {ad.creative?.body || '—'}
                                    </p>
                                    <p className="mt-1 text-[10px] text-gray-400">
                                      Created: {fmtDate(ad.created_time)}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-gray-400">No ads found in this ad set.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
