'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AdminShell from '../../_components/AdminShell';
import { useAuth } from '@/lib/auth/context';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import {
  ArrowLeft,
  Megaphone,
  LayoutGrid,
  MonitorPlay,
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

type Tab = 'campaigns' | 'adsets' | 'ads';

const TABS: { id: Tab; label: string; icon: typeof Megaphone }[] = [
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
  { id: 'adsets', label: 'Ad Sets', icon: LayoutGrid },
  { id: 'ads', label: 'Ads', icon: MonitorPlay },
];

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

  const [tab, setTab] = useState<Tab>('campaigns');
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
  const [loadingAdSets, setLoadingAdSets] = useState(false);
  const [loadingAds, setLoadingAds] = useState(false);

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
    setLoadingAdSets(true);
    const ids = adSetRefs.map((r) => r.metaObjectId).join(',');
    fetch(`/api/v1/meta/by-ids?type=ADSET&ids=${ids}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setAdSets(json.data);
      })
      .catch(() => {})
      .finally(() => setLoadingAdSets(false));
  }, [adSetRefs]);

  useEffect(() => {
    if (adRefs.length === 0) {
      setAds([]);
      return;
    }
    setLoadingAds(true);
    const ids = adRefs.map((r) => r.metaObjectId).join(',');
    fetch(`/api/v1/meta/by-ids?type=AD&ids=${ids}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setAds(json.data);
      })
      .catch(() => {})
      .finally(() => setLoadingAds(false));
  }, [adRefs]);

  const tabCounts: Record<Tab, number> = {
    campaigns: campaignRefs.length,
    adsets: adSetRefs.length,
    ads: adRefs.length,
  };

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

        {/* Summary badges */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-2 py-2 sm:px-4 sm:py-3 text-center">
            <p className="text-lg sm:text-2xl font-bold text-blue-700">{campaignRefs.length}</p>
            <p className="text-[10px] sm:text-xs font-medium text-blue-400">Campaigns</p>
          </div>
          <div className="rounded-xl border border-purple-100 bg-purple-50 px-2 py-2 sm:px-4 sm:py-3 text-center">
            <p className="text-lg sm:text-2xl font-bold text-purple-700">{adSetRefs.length}</p>
            <p className="text-[10px] sm:text-xs font-medium text-purple-400">Ad Sets</p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-2 py-2 sm:px-4 sm:py-3 text-center">
            <p className="text-lg sm:text-2xl font-bold text-emerald-700">{adRefs.length}</p>
            <p className="text-[10px] sm:text-xs font-medium text-emerald-400">Ads</p>
          </div>
        </div>

        {/* Tabs — all screen sizes */}
        <div>
          <div className="mb-4 flex flex-nowrap gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
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
          {tab === 'campaigns' && (
            <CampaignsSection campaigns={campaigns} loading={loadingCampaigns} />
          )}
          {tab === 'adsets' && (
            <AdSetsSection adSets={adSets} loading={loadingAdSets} />
          )}
          {tab === 'ads' && <AdsSection ads={ads} loading={loadingAds} />}
        </div>
      </div>
    </AdminShell>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Section Components — mirrors /dashboard/meta table designs
   ═══════════════════════════════════════════════════════════════ */

function Spinner() {
  return <AdminSectionSkeleton variant="tableEmbedded" />;
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
  loading,
}: {
  campaigns: Campaign[];
  loading: boolean;
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
              const start = c.start_time
                ? new Date(c.start_time).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '';
              const end = c.stop_time
                ? new Date(c.stop_time).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Ongoing';
              return (
                <tr key={c.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-3">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={c.name}
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="max-w-50 truncate px-4 py-3 font-medium text-gray-900">
                    {c.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-gray-500">
                    {c.objective?.replace(/_/g, ' ').toLowerCase() || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{budget}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {start ? `${start} – ${end}` : '—'}
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

/* ─── Ad Sets Section ─────────────────────────────────────────── */

function AdSetsSection({
  adSets,
  loading,
}: {
  adSets: AdSet[];
  loading: boolean;
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
              const start = a.start_time
                ? new Date(a.start_time).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : '';
              const end = a.end_time
                ? new Date(a.end_time).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Ongoing';
              return (
                <tr key={a.id} className="transition-colors hover:bg-gray-50">
                  <td className="max-w-55 truncate px-6 py-3 font-medium text-gray-900">
                    {a.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-gray-500">
                    {a.optimization_goal?.replace(/_/g, ' ').toLowerCase() || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{budget}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {start ? `${start} – ${end}` : '—'}
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

/* ─── Ads Section ─────────────────────────────────────────────── */

function AdsSection({
  ads,
  loading,
}: {
  ads: Ad[];
  loading: boolean;
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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ads.map((ad) => {
              const st = getStatusStyle(ad.effective_status);
              return (
                <tr key={ad.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-3">
                    {ad.creative?.thumbnail_url ? (
                      <img
                        src={ad.creative.thumbnail_url}
                        alt={ad.name}
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="max-w-45 truncate px-4 py-3 font-medium text-gray-900">
                    {ad.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>
                      {st.label}
                    </span>
                  </td>
                  <td className="max-w-40 truncate px-4 py-3 text-gray-400">
                    {ad.creative?.title || '—'}
                  </td>
                  <td className="max-w-50 truncate px-4 py-3 text-xs text-gray-500">
                    {ad.creative?.body || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {new Date(ad.created_time).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
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
