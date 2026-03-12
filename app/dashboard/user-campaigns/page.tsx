'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminShell from '../_components/AdminShell';
import { useAuth } from '@/lib/auth/context';
import {
  Loader2,
  Users,
  Megaphone,
  LayoutGrid,
  MonitorPlay,
  Eye,
  Phone,
  Mail,
} from 'lucide-react';

interface AssignedUser {
  id: string;
  fullName: string;
  phone: string;
  username: string;
  email: string;
  createdAt: string;
  avatarUrl?: string | null;
  counts: {
    campaigns: number;
    adSets: number;
    ads: number;
    total: number;
  };
}

/* ─── Interfaces for the user's own detail view ─── */

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

/* ─── Status badge styles ─── */

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  ACTIVE:          { color: 'bg-green-50 text-green-700 border border-green-200',   label: 'Active' },
  PAUSED:          { color: 'bg-amber-50 text-amber-700 border border-amber-200',   label: 'Paused' },
  CAMPAIGN_PAUSED: { color: 'bg-amber-50 text-amber-600 border border-amber-200',   label: 'Campaign Off' },
  ADSET_PAUSED:    { color: 'bg-amber-50 text-amber-600 border border-amber-200',   label: 'Ad Set Off' },
  IN_PROCESS:      { color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', label: 'In Review' },
  WITH_ISSUES:     { color: 'bg-orange-50 text-orange-600 border border-orange-200', label: 'Issues' },
  PENDING_REVIEW:  { color: 'bg-yellow-50 text-yellow-700 border border-yellow-200', label: 'Pending Review' },
  DISAPPROVED:     { color: 'bg-red-50 text-red-600 border border-red-200',          label: 'Not Approved' },
  NOT_DELIVERING:  { color: 'bg-orange-50 text-orange-600 border border-orange-200', label: 'Not Delivering' },
  DELETED:         { color: 'bg-red-50 text-red-600 border border-red-200',          label: 'Deleted' },
  ARCHIVED:        { color: 'bg-gray-100 text-gray-500 border border-gray-200',      label: 'Archived' },
  COMPLETED:       { color: 'bg-indigo-50 text-indigo-600 border border-indigo-200', label: 'Completed' },
  SCHEDULED:       { color: 'bg-blue-50 text-blue-700 border border-blue-200',       label: 'Scheduled' },
};

function getStatusStyle(status: string) {
  return STATUS_STYLES[status] || { color: 'bg-gray-100 text-gray-500', label: status?.replace(/_/g, ' ') || 'Unknown' };
}

type Tab = 'campaigns' | 'adsets' | 'ads';

const TABS: { id: Tab; label: string; icon: typeof Megaphone }[] = [
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'adsets', label: 'Ad Sets', icon: LayoutGrid },
  { id: 'ads', label: 'Ads', icon: MonitorPlay },
];

/* ═════════════════════════════════════════════════════════════════
   Main Page Component
   ═════════════════════════════════════════════════════════════════ */

export default function UserCampaignsPage() {
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === 'ADMIN';

  if (!authUser) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-red-500" />
        </div>
      </AdminShell>
    );
  }

  return isAdmin ? <AdminView /> : <UserOwnView userId={authUser.id} />;
}

/* ═════════════════════════════════════════════════════════════════
   Admin View — List all users with assignments
   ═════════════════════════════════════════════════════════════════ */

function AdminView() {
  const { accessToken, refreshSession } = useAuth();
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ─── Fetch wrapper: auto-refresh on 401 & retry once ──
  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      const newToken = await refreshSession();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        return fetch(url, { ...options, headers });
      }
    }
    return res;
  }, [accessToken, refreshSession]);

  useEffect(() => {
    authFetch('/api/v1/admin/meta-assignments/users')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setUsers(json.data);
        } else {
          setError(json.error || 'Failed to load');
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authFetch]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Assign User To Campaign</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            View users who have campaigns, ad sets, or ads assigned to them
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-red-500" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center text-sm text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="rounded-xl border border-gray-100 bg-white px-6 py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No users have any assignments yet.</p>
            <p className="mt-1 text-xs text-gray-400">
              Assign campaigns, ad sets, or ads from the Ads Manager page.
            </p>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="group rounded-xl border border-gray-100 bg-white p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  {user.avatarUrl ? (
                    <Image src={user.avatarUrl} alt="avatar" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                      {user.fullName
                        ?.split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {user.fullName}
                    </p>
                    {user.phone && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </p>
                    )}
                    {user.email && (
                      <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-400">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-blue-50 px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Megaphone className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-lg font-bold text-blue-700">
                        {user.counts.campaigns}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-blue-400">
                      Campaigns
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-50 px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <LayoutGrid className="h-3.5 w-3.5 text-purple-500" />
                      <span className="text-lg font-bold text-purple-700">
                        {user.counts.adSets}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-purple-400">
                      Ad Sets
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <MonitorPlay className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-lg font-bold text-emerald-700">
                        {user.counts.ads}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                      Ads
                    </p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/user-campaigns/${user.id}`}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-red-600 hover:text-white hover:border-red-600"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}

/* ═════════════════════════════════════════════════════════════════
   User View — Show the logged-in user's own assigned campaigns
   ═════════════════════════════════════════════════════════════════ */

function UserOwnView({ userId }: { userId: string }) {
  const { accessToken, refreshSession } = useAuth();

  // ─── Fetch wrapper: auto-refresh on 401 & retry once ──
  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      const newToken = await refreshSession();
      if (newToken) {
        headers.set('Authorization', `Bearer ${newToken}`);
        return fetch(url, { ...options, headers });
      }
    }
    return res;
  }, [accessToken, refreshSession]);

  const [tab, setTab] = useState<Tab>('campaigns');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [campaignRefs, setCampaignRefs] = useState<AssignmentRef[]>([]);
  const [adSetRefs, setAdSetRefs] = useState<AssignmentRef[]>([]);
  const [adRefs, setAdRefs] = useState<AssignmentRef[]>([]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adSets, setAdSets] = useState<AdSet[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);

  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingAdSets, setLoadingAdSets] = useState(false);
  const [loadingAds, setLoadingAds] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  // Step 1: Fetch assignment references for the current user
  useEffect(() => {
    setLoading(true);
    authFetch(`/api/v1/admin/meta-assignments/users/${userId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setCampaignRefs(json.data.campaigns);
          setAdSetRefs(json.data.adSets);
          setAdRefs(json.data.ads);
        } else {
          setError(json.error || 'Failed to load');
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId, authFetch]);

  // Step 2: Fetch actual Meta objects when refs change
  useEffect(() => {
    if (campaignRefs.length === 0) { setCampaigns([]); return; }
    setLoadingCampaigns(true);
    const ids = campaignRefs.map((r) => r.metaObjectId).join(',');
    authFetch(`/api/v1/meta/by-ids?type=CAMPAIGN&ids=${ids}`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setCampaigns(json.data); })
      .catch(() => {})
      .finally(() => setLoadingCampaigns(false));
  }, [campaignRefs, authFetch]);

  useEffect(() => {
    if (adSetRefs.length === 0) { setAdSets([]); return; }
    setLoadingAdSets(true);
    const ids = adSetRefs.map((r) => r.metaObjectId).join(',');
    authFetch(`/api/v1/meta/by-ids?type=ADSET&ids=${ids}`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setAdSets(json.data); })
      .catch(() => {})
      .finally(() => setLoadingAdSets(false));
  }, [adSetRefs, authFetch]);

  useEffect(() => {
    if (adRefs.length === 0) { setAds([]); return; }
    setLoadingAds(true);
    const ids = adRefs.map((r) => r.metaObjectId).join(',');
    authFetch(`/api/v1/meta/by-ids?type=AD&ids=${ids}`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setAds(json.data); })
      .catch(() => {})
      .finally(() => setLoadingAds(false));
  }, [adRefs, authFetch]);

  // Toggle campaign status between ACTIVE and PAUSED
  const toggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setTogglingId(campaign.id);
    try {
      const res = await authFetch('/api/v1/meta/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaign.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        // Optimistically update the local row
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaign.id
              ? { ...c, status: newStatus, effective_status: newStatus }
              : c,
          ),
        );
      } else {
        alert(`Failed: ${json.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  // Can this campaign be toggled?
  const canToggle = (c: Campaign) =>
    ['ACTIVE', 'PAUSED'].includes(c.status) &&
    !['DELETED', 'ARCHIVED'].includes(c.effective_status);

  // Toggle ad set status
  const toggleAdSetStatus = async (adSet: AdSet) => {
    const newStatus = adSet.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setTogglingId(adSet.id);
    try {
      const res = await authFetch('/api/v1/meta/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adSet.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setAdSets((prev) =>
          prev.map((a) =>
            a.id === adSet.id
              ? { ...a, status: newStatus, effective_status: newStatus }
              : a,
          ),
        );
      } else {
        alert(`Failed: ${json.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  // Toggle ad status
  const toggleAdStatus = async (ad: Ad) => {
    const newStatus = ad.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setTogglingId(ad.id);
    try {
      const res = await authFetch('/api/v1/meta/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setAds((prev) =>
          prev.map((a) =>
            a.id === ad.id
              ? { ...a, status: newStatus, effective_status: newStatus }
              : a,
          ),
        );
      } else {
        alert(`Failed: ${json.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  // Can ad sets/ads be toggled?
  const canToggleAdSet = (a: AdSet) =>
    ['ACTIVE', 'PAUSED'].includes(a.status) &&
    !['DELETED', 'ARCHIVED'].includes(a.effective_status);

  const canToggleAd = (a: Ad) =>
    ['ACTIVE', 'PAUSED'].includes(a.status) &&
    !['DELETED', 'ARCHIVED'].includes(a.effective_status);

  const tabCounts: Record<Tab, number> = {
    campaigns: campaignRefs.length,
    adsets: adSetRefs.length,
    ads: adRefs.length,
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Campaigns</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Campaigns, ad sets, and ads assigned to you
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-red-500" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Summary badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{campaignRefs.length}</p>
                <p className="text-xs font-medium text-blue-400">Campaigns</p>
              </div>
              <div className="rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-purple-700">{adSetRefs.length}</p>
                <p className="text-xs font-medium text-purple-400">Ad Sets</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">{adRefs.length}</p>
                <p className="text-xs font-medium text-emerald-400">Ads</p>
              </div>
            </div>

            {/* No assignments at all */}
            {campaignRefs.length === 0 && adSetRefs.length === 0 && adRefs.length === 0 && (
              <div className="rounded-xl border border-gray-100 bg-white px-6 py-16 text-center">
                <Megaphone className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">No campaigns assigned to you yet.</p>
                <p className="mt-1 text-xs text-gray-400">
                  Contact admin to get campaigns, ad sets, or ads assigned.
                </p>
              </div>
            )}

            {/* Tabs + content */}
            {(campaignRefs.length > 0 || adSetRefs.length > 0 || adRefs.length > 0) && (
              <div>
                <div className="mb-4 flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all sm:gap-2 sm:px-3 sm:text-sm ${
                        tab === t.id
                          ? 'bg-red-600 text-white shadow-sm shadow-red-500/20'
                          : 'text-gray-500 hover:bg-white hover:text-gray-700'
                      }`}
                    >
                      <t.icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                      <span className="truncate">{t.label}</span>
                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                          tab === t.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {tabCounts[t.id]}
                      </span>
                    </button>
                  ))}
                </div>
                {tab === 'campaigns' && <CampaignsSection campaigns={campaigns} loading={loadingCampaigns} canToggle={canToggle} toggleStatus={toggleStatus} togglingId={togglingId} />}
                {tab === 'adsets' && <AdSetsSection adSets={adSets} loading={loadingAdSets} canToggleAdSet={canToggleAdSet} toggleAdSetStatus={toggleAdSetStatus} togglingId={togglingId} />}
                {tab === 'ads' && <AdsSection ads={ads} loading={loadingAds} canToggleAd={canToggleAd} toggleAdStatus={toggleAdStatus} togglingId={togglingId} />}
              </div>
            )}
          </>
        )}
      </div>
    </AdminShell>
  );
}

/* ═════════════════════════════════════════════════════════════════
   Tab Section Components
   ═════════════════════════════════════════════════════════════════ */

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-red-500" />
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-500">
      No {label} assigned.
    </div>
  );
}

/* ─── Campaigns Section ─── */

function CampaignsSection({ campaigns, loading, canToggle, toggleStatus, togglingId }: {
  campaigns: Campaign[];
  loading: boolean;
  canToggle: (c: Campaign) => boolean;
  toggleStatus: (c: Campaign) => Promise<void>;
  togglingId: string | null;
}) {
  if (loading) return <Spinner />;
  if (campaigns.length === 0) return <Empty label="campaigns" />;

  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <th className="px-6 py-3 font-medium">Preview</th>
              <th className="px-4 py-3 font-medium">Campaign Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Objective</th>
              <th className="px-4 py-3 font-medium">Budget</th>
              <th className="px-4 py-3 font-medium">Date Range</th>
              <th className="px-4 py-3 font-medium text-center">Toggle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map((c) => {
              const st = getStatusStyle(c.effective_status);
              const thumb = c.ads?.data?.[0]?.creative?.thumbnail_url;
              const budget = c.daily_budget
                ? `$${(parseInt(c.daily_budget) / 100).toFixed(2)}/day`
                : c.lifetime_budget
                  ? `$${(parseInt(c.lifetime_budget) / 100).toFixed(2)} total`
                  : '—';
              const start = c.start_time ? new Date(c.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
              const end = c.stop_time ? new Date(c.stop_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Ongoing';
              return (
                <tr key={c.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-3">
                    {thumb ? (
                      <img src={thumb} alt={c.name} className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">N/A</div>
                    )}
                  </td>
                  <td className="max-w-50 truncate px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-gray-500">{c.objective?.replace(/_/g, ' ').toLowerCase() || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{budget}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{start ? `${start} – ${end}` : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {canToggle(c) ? (
                      <button
                        onClick={() => toggleStatus(c)}
                        disabled={togglingId === c.id}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 ${
                          c.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                        } ${togglingId === c.id ? 'opacity-50' : ''}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                            c.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Ad Sets Section ─── */

function AdSetsSection({ adSets, loading, canToggleAdSet, toggleAdSetStatus, togglingId }: {
  adSets: AdSet[];
  loading: boolean;
  canToggleAdSet: (a: AdSet) => boolean;
  toggleAdSetStatus: (a: AdSet) => Promise<void>;
  togglingId: string | null;
}) {
  if (loading) return <Spinner />;
  if (adSets.length === 0) return <Empty label="ad sets" />;

  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <th className="px-6 py-3 font-medium">Ad Set Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Optimization</th>
              <th className="px-4 py-3 font-medium">Budget</th>
              <th className="px-4 py-3 font-medium">Schedule</th>
              <th className="px-4 py-3 font-medium text-center">Toggle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {adSets.map((a) => {
              const st = getStatusStyle(a.effective_status);
              const budget = a.daily_budget
                ? `$${(parseInt(a.daily_budget) / 100).toFixed(2)}/day`
                : a.lifetime_budget
                  ? `$${(parseInt(a.lifetime_budget) / 100).toFixed(2)} total`
                  : '—';
              const start = a.start_time ? new Date(a.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
              const end = a.end_time ? new Date(a.end_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Ongoing';
              return (
                <tr key={a.id} className="transition-colors hover:bg-gray-50">
                  <td className="max-w-55 truncate px-6 py-3 font-medium text-gray-900">{a.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-gray-500">{a.optimization_goal?.replace(/_/g, ' ').toLowerCase() || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{budget}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{start ? `${start} – ${end}` : '—'}</td>
                  <td className="px-4 py-3 text-center">
                    {canToggleAdSet(a) ? (
                      <button
                        onClick={() => toggleAdSetStatus(a)}
                        disabled={togglingId === a.id}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 ${
                          a.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                        } ${togglingId === a.id ? 'opacity-50' : ''}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                            a.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Ads Section ─── */

function AdsSection({ ads, loading, canToggleAd, toggleAdStatus, togglingId }: {
  ads: Ad[];
  loading: boolean;
  canToggleAd: (a: Ad) => boolean;
  toggleAdStatus: (a: Ad) => Promise<void>;
  togglingId: string | null;
}) {
  if (loading) return <Spinner />;
  if (ads.length === 0) return <Empty label="ads" />;

  return (
    <div className="rounded-xl border border-gray-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
              <th className="px-6 py-3 font-medium">Preview</th>
              <th className="px-4 py-3 font-medium">Ad Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Creative Title</th>
              <th className="px-4 py-3 font-medium">Body</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-center">Toggle</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ads.map((ad) => {
              const st = getStatusStyle(ad.effective_status);
              return (
                <tr key={ad.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-3">
                    {ad.creative?.thumbnail_url ? (
                      <img src={ad.creative.thumbnail_url} alt={ad.name} className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">N/A</div>
                    )}
                  </td>
                  <td className="max-w-50 truncate px-4 py-3 font-medium text-gray-900">{ad.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
                  </td>
                  <td className="max-w-40 truncate px-4 py-3 text-xs text-gray-500">{ad.creative?.title || '—'}</td>
                  <td className="max-w-48 truncate px-4 py-3 text-xs text-gray-500">{ad.creative?.body || '—'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {new Date(ad.created_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {canToggleAd(ad) ? (
                      <button
                        onClick={() => toggleAdStatus(ad)}
                        disabled={togglingId === ad.id}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 ${
                          ad.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                        } ${togglingId === ad.id ? 'opacity-50' : ''}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                            ad.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
