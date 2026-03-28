'use client';

import { useState, useEffect, use, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import AdminShell from '../../_components/AdminShell';
import { useAuth } from '@/lib/auth/context';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import {
  ArrowLeft,
  Phone,
  Mail,
} from 'lucide-react';

/* ─── Interfaces ──────────────────────────────────────────────── */

interface UserInfo {
  id: string;
  fullName: string;
  phone: string;
  username: string;
  email: string;
  avatarUrl?: string | null;
}

interface AssignmentRef {
  metaObjectId: string;
  metaAccountId: string;
}

interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  effective_status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  start_time?: string;
  stop_time?: string;
  created_time: string;
  ads?: { data: Array<{ creative?: { thumbnail_url?: string } }> };
}

interface AdSet {
  id: string;
  name: string;
  status: string;
  effective_status: string;
  campaign_id: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget_remaining?: string;
  optimization_goal?: string;
  start_time?: string;
  end_time?: string;
  created_time: string;
  targeting?: any;
}

interface Ad {
  id: string;
  name: string;
  status: string;
  effective_status: string;
  adset_id: string;
  campaign_id: string;
  created_time: string;
  creative?: {
    id: string;
    name?: string;
    thumbnail_url?: string;
    body?: string;
    title?: string;
    image_url?: string;
  };
}

/* ─── Status badge styles ─────────────────────────────────────── */

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  ACTIVE:              { color: 'bg-green-50 text-green-700 border border-green-200',   label: 'Active' },
  PAUSED:              { color: 'bg-amber-50 text-amber-700 border border-amber-200',   label: 'Paused' },
  CAMPAIGN_PAUSED:     { color: 'bg-amber-50 text-amber-600 border border-amber-200',   label: 'Campaign Off' },
  ADSET_PAUSED:        { color: 'bg-amber-50 text-amber-600 border border-amber-200',   label: 'Ad Set Off' },
  IN_PROCESS:          { color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', label: 'In Review' },
  WITH_ISSUES:         { color: 'bg-orange-50 text-orange-600 border border-orange-200', label: 'Issues' },
  PENDING_REVIEW:      { color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', label: 'Pending Review' },
  DISAPPROVED:         { color: 'bg-red-50 text-red-600 border border-red-200',          label: 'Not Approved' },
  NOT_DELIVERING:      { color: 'bg-orange-50 text-orange-600 border border-orange-200', label: 'Not Delivering' },
  DELETED:             { color: 'bg-red-50 text-red-600 border border-red-200',          label: 'Deleted' },
  ARCHIVED:            { color: 'bg-gray-100 text-gray-500 border border-gray-200',      label: 'Archived' },
  COMPLETED:           { color: 'bg-indigo-50 text-indigo-600 border border-indigo-200', label: 'Completed' },
  SCHEDULED:           { color: 'bg-blue-50 text-blue-700 border border-blue-200',       label: 'Scheduled' },
};

function getStatusStyle(status: string) {
  return STATUS_STYLES[status] || { color: 'bg-gray-100 text-gray-500', label: status?.replace(/_/g, ' ') || 'Unknown' };
}

function formatBudgetValue(daily?: string, lifetime?: string) {
  if (daily) return `$${(parseInt(daily, 10) / 100).toFixed(2)}/day`;
  if (lifetime) return `$${(parseInt(lifetime, 10) / 100).toFixed(2)} total`;
  return '—';
}

function formatShortRange(start?: string, end?: string) {
  const s = start
    ? new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
  const e = end
    ? new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Ongoing';
  return s ? `${s} - ${e}` : '—';
}

function DetailModal({
  title,
  subtitle,
  rows,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  rows: Array<{ label: string; value: string }>;
  children?: ReactNode;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/60 p-3 sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-[min(1100px,96vw)] max-h-[90vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_28px_90px_-30px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-linear-to-r from-slate-50 via-white to-red-50/60 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between">
            <div className="min-w-0 pr-4">
              <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg">{title}</h3>
              {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="rounded-lg px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">×</button>
          </div>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto">
          <div className="grid grid-cols-1 gap-3 border-t border-gray-100 p-5 sm:grid-cols-2 sm:p-6">
            {rows.map((row) => (
              <div key={row.label} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">{row.label}</p>
                <p className="mt-1 wrap-break-word text-sm font-medium text-gray-900">{row.value || '—'}</p>
              </div>
            ))}
          </div>
          {children ? <div className="border-t border-gray-100 px-5 py-5 sm:px-6">{children}</div> : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Main Page ───────────────────────────────────────────────── */

export default function UserCampaignDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const router = useRouter();
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === 'ADMIN';

  // Non-admin users can only view their own assignments
  useEffect(() => {
    if (authUser && !isAdmin && authUser.id !== userId) {
      router.replace('/dashboard/user-campaigns');
    }
  }, [authUser, isAdmin, userId, router]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [user, setUser] = useState<UserInfo | null>(null);
  const [campaignRefs, setCampaignRefs] = useState<AssignmentRef[]>([]);
  const [adSetRefs, setAdSetRefs] = useState<AssignmentRef[]>([]);
  const [adRefs, setAdRefs] = useState<AssignmentRef[]>([]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adSets, setAdSets] = useState<AdSet[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);

  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingAdSetsInModal, setLoadingAdSetsInModal] = useState(false);
  const [loadingAdsInModal, setLoadingAdsInModal] = useState(false);

  // Step 1: Fetch user assignment references
  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/admin/meta-assignments/users/${userId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setUser(json.data.user);
          setCampaignRefs(json.data.campaigns);
          setAdSetRefs(json.data.adSets);
          setAdRefs(json.data.ads);
        } else {
          setError(json.error || 'Failed to load');
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  // Step 2: Fetch actual Meta objects when refs change
  useEffect(() => {
    if (campaignRefs.length === 0) {
      setCampaigns([]);
      return;
    }
    setLoadingCampaigns(true);
    const ids = campaignRefs.map((r) => r.metaObjectId).join(',');
    fetch(`/api/v1/meta/by-ids?type=CAMPAIGN&ids=${ids}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCampaigns(json.data);
      })
      .catch(() => {})
      .finally(() => setLoadingCampaigns(false));
  }, [campaignRefs]);

  useEffect(() => {
    if (adSetRefs.length === 0) {
      setAdSets([]);
      return;
    }
    setLoadingAdSetsInModal(true);
    const ids = adSetRefs.map((r) => r.metaObjectId).join(',');
    fetch(`/api/v1/meta/by-ids?type=ADSET&ids=${ids}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setAdSets(json.data);
      })
      .catch(() => {})
      .finally(() => setLoadingAdSetsInModal(false));
  }, [adSetRefs]);

  useEffect(() => {
    if (adRefs.length === 0) {
      setAds([]);
      return;
    }
    setLoadingAdsInModal(true);
    const ids = adRefs.map((r) => r.metaObjectId).join(',');
    fetch(`/api/v1/meta/by-ids?type=AD&ids=${ids}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setAds(json.data);
      })
      .catch(() => {})
      .finally(() => setLoadingAdsInModal(false));
  }, [adRefs]);

  if (loading) {
    return (
      <AdminShell>
        <AdminSectionSkeleton variant="meta" />
      </AdminShell>
    );
  }

  if (error) {
    return (
      <AdminShell>
        <div className="py-20 text-center text-sm text-red-500">{error}</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-4 sm:space-y-5">
        {/* Back + Header */}
        {isAdmin ? (
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.push('/dashboard/user-campaigns')}
              className="mt-1 rounded-lg border border-gray-200 p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                {user?.avatarUrl ? (
                  <Image src={user.avatarUrl} alt="avatar" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                    {user?.fullName
                      ?.split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || '?'}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{user?.fullName}</h1>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    {user?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </span>
                    )}
                    {user?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Campaigns</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Campaigns, ad sets, and ads assigned to you
            </p>
          </div>
        )}

        <CampaignsSection
          campaigns={campaigns}
          adSets={adSets}
          ads={ads}
          campaignAccountById={Object.fromEntries(campaignRefs.map((r) => [r.metaObjectId, r.metaAccountId]))}
          loading={loadingCampaigns}
          loadingRelated={loadingAdSetsInModal || loadingAdsInModal}
        />
      </div>
    </AdminShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Section Components — mirrors /dashboard/meta table designs
   ═══════════════════════════════════════════════════════════════ */

function Spinner() {
  return <AdminSectionSkeleton variant="grid" />;
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-500">
      No {label} assigned.
    </div>
  );
}

/* ─── Campaigns Section ───────────────────────────────────────── */

function CampaignsSection({
  campaigns,
  adSets,
  ads,
  campaignAccountById,
  loading,
  loadingRelated,
}: {
  campaigns: Campaign[];
  adSets: AdSet[];
  ads: Ad[];
  campaignAccountById: Record<string, string>;
  loading: boolean;
  loadingRelated: boolean;
}) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [modalAdSets, setModalAdSets] = useState<AdSet[]>([]);
  const [modalAdsByAdSet, setModalAdsByAdSet] = useState<Record<string, Ad[]>>({});
  const [modalDetailsLoading, setModalDetailsLoading] = useState(false);
  const [modalDetailsError, setModalDetailsError] = useState('');

  useEffect(() => {
    if (!selectedCampaign) return;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [selectedCampaign]);

  useEffect(() => {
    if (!selectedCampaign) return;

    let cancelled = false;

    const loadCampaignDetails = async () => {
      setModalDetailsLoading(true);
      setModalDetailsError('');
      setModalAdSets([]);
      setModalAdsByAdSet({});

      try {
        const adSetQuery = new URLSearchParams({ campaign_id: selectedCampaign.id, limit: '20' });
        const accountId = campaignAccountById[selectedCampaign.id];
        if (accountId) adSetQuery.set('account_id', accountId);

        const adSetRes = await fetch(`/api/v1/meta/adsets?${adSetQuery.toString()}`);
        const adSetJson = await adSetRes.json();

        if (!adSetJson.success) throw new Error(adSetJson.error || 'Failed to load ad sets');

        const loadedAdSets = (Array.isArray(adSetJson.data) ? adSetJson.data : []) as AdSet[];
        if (cancelled) return;
        setModalAdSets(loadedAdSets);

        if (loadedAdSets.length === 0) {
          setModalAdsByAdSet({});
          return;
        }

        const adFetches = loadedAdSets.map(async (adSet) => {
          const adsQuery = new URLSearchParams({ adset_id: adSet.id, limit: '12' });
          if (accountId) adsQuery.set('account_id', accountId);
          const adsRes = await fetch(`/api/v1/meta/ads?${adsQuery.toString()}`);
          const adsJson = await adsRes.json();
          return {
            adSetId: adSet.id,
            ads: (adsJson.success && Array.isArray(adsJson.data) ? adsJson.data : []) as Ad[],
          };
        });

        const settled = await Promise.allSettled(adFetches);
        if (cancelled) return;

        const nextMap: Record<string, Ad[]> = {};
        settled.forEach((result) => {
          if (result.status === 'fulfilled') {
            nextMap[result.value.adSetId] = result.value.ads;
          }
        });
        setModalAdsByAdSet(nextMap);
      } catch (e: any) {
        if (!cancelled) setModalDetailsError(e?.message || 'Failed to load campaign details');
      } finally {
        if (!cancelled) setModalDetailsLoading(false);
      }
    };

    loadCampaignDetails();

    return () => {
      cancelled = true;
    };
  }, [selectedCampaign, campaignAccountById]);

  if (loading) return <Spinner />;
  if (campaigns.length === 0) return <Empty label="campaigns" />;

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
          <h3 className="text-sm font-semibold text-gray-800">Campaigns</h3>
        </div>

        {campaigns.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-500">No campaigns found.</div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="space-y-3 p-3 md:hidden">
              {campaigns.map((c) => {
                const st = getStatusStyle(c.effective_status);
                const thumb = c.ads?.data?.[0]?.creative?.thumbnail_url;
                const budget = formatBudgetValue(c.daily_budget, c.lifetime_budget);
                const dateRange = formatShortRange(c.start_time, c.stop_time);
                const isActive = (c.effective_status || c.status || '').toUpperCase() === 'ACTIVE';

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCampaign(c)}
                    className="w-full rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm transition-colors hover:border-gray-300"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="relative shrink-0">
                        {thumb ? (
                          <img src={thumb} alt={c.name} className="h-11 w-11 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-[10px] text-gray-400">N/A</div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{c.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${st.color}`}>{st.label}</span>
                          <p className="truncate text-[11px] uppercase text-gray-500">{c.objective?.replace(/_/g, ' ') || 'No objective'}</p>
                        </div>
                        <p className="mt-1 text-xs text-gray-600"><span className="text-gray-500">Budget:</span> {budget}</p>
                        <p className="mt-0.5 text-xs text-gray-600"><span className="text-gray-500">Date:</span> {dateRange}</p>
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2.5">
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600">
                        {adSets.filter((a) => a.campaign_id === c.id).length} ad sets
                      </span>
                      <div className="inline-flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">Active</span>
                        <span className={`inline-flex h-5 w-9 items-center rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                          <span className={`h-3.5 w-3.5 rounded-full bg-white shadow ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Desktop / tablet cards */}
            <div className="hidden gap-3 p-4 sm:p-5 md:grid md:grid-cols-2 xl:grid-cols-2">
              {campaigns.map((c) => {
                const st = getStatusStyle(c.effective_status);
                const thumb = c.ads?.data?.[0]?.creative?.thumbnail_url;
                const budget = formatBudgetValue(c.daily_budget, c.lifetime_budget);
                const dateRange = formatShortRange(c.start_time, c.stop_time);
                const isActive = (c.effective_status || c.status || '').toUpperCase() === 'ACTIVE';

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCampaign(c)}
                    className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <div className="relative shrink-0">
                        {thumb ? (
                          <img src={thumb} alt={c.name} className="h-12 w-12 rounded-lg object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-[10px] text-gray-400">N/A</div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{c.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
                          <p className="truncate text-xs uppercase text-gray-500">{c.objective?.replace(/_/g, ' ') || 'No objective'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm text-gray-700">
                      <p><span className="text-gray-500">Budget:</span> {budget}</p>
                      <p><span className="text-gray-500">Date Range:</span> {dateRange}</p>
                      <p>
                        <span className="text-gray-500">Created:</span>{' '}
                        {new Date(c.created_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                      <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
                        {adSets.filter((a) => a.campaign_id === c.id).length} ad sets
                      </span>
                      <div className="inline-flex items-center gap-2 shrink-0">
                        <span className="text-sm text-gray-500">Active</span>
                        <span className={`inline-flex h-5 w-9 items-center rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'}`}>
                          <span className={`h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {selectedCampaign && (() => {
        const fallbackAdSets = adSets.filter((a) => a.campaign_id === selectedCampaign.id);
        const relatedAdSets = modalAdSets.length > 0 ? modalAdSets : fallbackAdSets;
        const relatedAdSetIds = new Set(relatedAdSets.map((a) => a.id));
        const modalAds = Object.values(modalAdsByAdSet).flat();
        const fallbackAds = ads.filter((ad) => ad.campaign_id === selectedCampaign.id || relatedAdSetIds.has(ad.adset_id));
        const relatedAds = modalAds.length > 0 ? modalAds : fallbackAds;
        const adSetCount = relatedAdSets.length;
        const adCount = relatedAds.length;

        return (
          <DetailModal
            title={selectedCampaign.name}
            subtitle={`Campaign ID: ${selectedCampaign.id}`}
            onClose={() => setSelectedCampaign(null)}
            rows={[
              { label: 'Status', value: getStatusStyle(selectedCampaign.effective_status).label },
              { label: 'Objective', value: selectedCampaign.objective?.replace(/_/g, ' ').toLowerCase() || '—' },
              { label: 'Budget', value: formatBudgetValue(selectedCampaign.daily_budget, selectedCampaign.lifetime_budget) },
              { label: 'Date Range', value: formatShortRange(selectedCampaign.start_time, selectedCampaign.stop_time) },
              { label: 'Created', value: new Date(selectedCampaign.created_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
            ]}
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-semibold text-gray-900">Ad Sets & Ads</h4>
                <p className="mt-1 text-xs text-gray-500">All ad sets under this campaign and their ads</p>

                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:max-w-sm">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Ad Sets</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">{adSetCount}</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Ads</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">{adCount}</p>
                  </div>
                </div>

                {modalDetailsError ? (
                  <p className="mt-2 text-xs text-red-500">{modalDetailsError}</p>
                ) : (loadingRelated || modalDetailsLoading) ? (
                  <p className="mt-2 text-xs text-gray-500">Loading ad sets...</p>
                ) : relatedAdSets.length === 0 ? (
                  <p className="mt-2 text-xs text-gray-500">No ad sets found for this campaign.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {relatedAdSets.map((adSet) => (
                      <div key={adSet.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{adSet.name}</p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              Budget: {formatBudgetValue(adSet.daily_budget, adSet.lifetime_budget)}
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              Date: {formatShortRange(adSet.start_time, adSet.end_time)}
                            </p>
                          </div>
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusStyle(adSet.effective_status).color}`}>
                            {getStatusStyle(adSet.effective_status).label}
                          </span>
                        </div>

                        <div className="mt-3 space-y-2 border-t border-gray-200 pt-2.5">
                          {relatedAds.filter((ad) => ad.adset_id === adSet.id).length === 0 ? (
                            <p className="text-xs text-gray-500">No ads under this ad set.</p>
                          ) : (
                            relatedAds
                              .filter((ad) => ad.adset_id === adSet.id)
                              .map((ad) => (
                                <div key={ad.id} className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2">
                                  {ad.creative?.thumbnail_url ? (
                                    <img src={ad.creative.thumbnail_url} alt={ad.name} className="h-8 w-8 rounded-md object-cover" />
                                  ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-200 text-[10px] text-gray-500">N/A</div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900">{ad.name}</p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusStyle(ad.effective_status).color}`}>
                                        {getStatusStyle(ad.effective_status).label}
                                      </span>
                                      <span className="truncate text-xs text-gray-600">{ad.creative?.title || 'No creative title'}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    ))}
                    {relatedAds.filter((ad) => !relatedAdSetIds.has(ad.adset_id)).length > 0 && (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-medium text-gray-500">Unlinked Ads</p>
                        <div className="mt-2 space-y-2">
                          {relatedAds
                            .filter((ad) => !relatedAdSetIds.has(ad.adset_id))
                            .map((ad) => (
                              <div key={ad.id} className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2">
                                {ad.creative?.thumbnail_url ? (
                                  <img src={ad.creative.thumbnail_url} alt={ad.name} className="h-8 w-8 rounded-md object-cover" />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-200 text-[10px] text-gray-500">N/A</div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-gray-900">{ad.name}</p>
                                  <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusStyle(ad.effective_status).color}`}>
                                      {getStatusStyle(ad.effective_status).label}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    {relatedAdSets.length === 0 && relatedAds.length > 0 && (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                        <div className="space-y-2">
                          {relatedAds.map((ad) => (
                            <div key={ad.id} className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2">
                              {ad.creative?.thumbnail_url ? (
                                <img src={ad.creative.thumbnail_url} alt={ad.name} className="h-8 w-8 rounded-md object-cover" />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-200 text-[10px] text-gray-500">N/A</div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">{ad.name}</p>
                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusStyle(ad.effective_status).color}`}>
                                    {getStatusStyle(ad.effective_status).label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {relatedAdSets.length === 0 && relatedAds.length === 0 && (
                      <p className="text-xs text-gray-500">No ads found for this campaign.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DetailModal>
        );
      })()}
    </>
  );
}
