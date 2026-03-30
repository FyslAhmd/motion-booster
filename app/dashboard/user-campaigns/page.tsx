'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminShell from '../_components/AdminShell';
import { useAuth } from '@/lib/auth/context';
import { useConfirm } from '@/lib/admin/confirm';
import { toast } from 'sonner';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
import {
  Users,
  Megaphone,
  LayoutGrid,
  MonitorPlay,
  Eye,
  Phone,
  Mail,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { createPortal } from 'react-dom';

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

function toCount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeAssignedUsers(payload: unknown): AssignedUser[] {
  if (!Array.isArray(payload)) return [];

  return payload
    .map((item) => {
      const user = (item ?? {}) as Record<string, unknown>;
      const counts = ((user.counts ?? {}) as Record<string, unknown>);

      const campaigns = toCount(
        counts.campaigns ?? counts.campaignCount ?? counts.campaignsCount ?? user.campaigns,
      );
      const adSets = toCount(
        counts.adSets ?? counts.adsets ?? counts.ad_sets ?? counts.adSet ?? user.adSets ?? user.adsets,
      );
      const ads = toCount(
        counts.ads ?? counts.adsCount ?? counts.ad_count ?? user.ads,
      );

      return {
        id: String(user.id ?? ''),
        fullName: String(user.fullName ?? ''),
        phone: String(user.phone ?? ''),
        username: String(user.username ?? ''),
        email: String(user.email ?? ''),
        createdAt: String(user.createdAt ?? ''),
        avatarUrl: typeof user.avatarUrl === 'string' ? user.avatarUrl : null,
        counts: {
          campaigns,
          adSets,
          ads,
          total: campaigns + adSets + ads,
        },
      };
    })
    .filter((user) => user.id.length > 0);
}
/* --- Interfaces for the user's own detail view --- */

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

/* --- Status badge styles --- */

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

const META_PAGE_LIMIT = 50;
const MAX_META_PAGES = 200;

function formatBudgetValue(daily?: string, lifetime?: string) {
  if (daily) return `$${(parseInt(daily, 10) / 100).toFixed(2)}/day`;
  if (lifetime) return `$${(parseInt(lifetime, 10) / 100).toFixed(2)} total`;
  return 'N/A';
}

function formatShortRange(start?: string, end?: string) {
  const s = start
    ? new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
  const e = end
    ? new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Ongoing';
  return s ? `${s} - ${e}` : 'N/A';
}

async function fetchAllMetaPages<T>({
  endpoint,
  baseQuery,
}: {
  endpoint: '/api/v1/meta/adsets' | '/api/v1/meta/ads';
  baseQuery: URLSearchParams;
}): Promise<T[]> {
  const all: T[] = [];
  let after: string | null = null;

  for (let page = 0; page < MAX_META_PAGES; page += 1) {
    const query = new URLSearchParams(baseQuery);
    query.set('limit', String(META_PAGE_LIMIT));
    if (after) query.set('after', after);

    const res = await fetch(`${endpoint}?${query.toString()}`);
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error || `Failed to load ${endpoint}`);
    }

    if (Array.isArray(json.data)) {
      all.push(...json.data);
    }

    const nextAfter = json?.paging?.hasNext ? json?.paging?.cursors?.after : null;
    if (!nextAfter) break;
    after = nextAfter;
  }

  return all;
}

async function fetchCampaignChildCounts(campaignId: string, accountId?: string): Promise<{ adSets: number; ads: number }> {
  const query = new URLSearchParams({ campaign_id: campaignId });
  if (accountId) query.set('account_id', accountId);

  const res = await fetch(`/api/v1/meta/campaign-children-count?${query.toString()}`);
  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || 'Failed to fetch campaign child counts');
  }

  return {
    adSets: Number(json?.data?.adSets ?? 0),
    ads: Number(json?.data?.ads ?? 0),
  };
}

/* -----------------------------------------------------------------
   Main Page Component
   ----------------------------------------------------------------- */

export default function UserCampaignsPage() {
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === 'ADMIN';

  if (!authUser) {
    return (
      <AdminShell>
        <AdminSectionSkeleton variant="meta" />
      </AdminShell>
    );
  }

  return isAdmin ? <AdminView /> : <UserOwnView userId={authUser.id} />;
}

/* -----------------------------------------------------------------
  Admin View - List all users with assignments
  ----------------------------------------------------------------- */

function AdminView() {
  const { accessToken, refreshSession } = useAuth();
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'campaigns' | 'adsets' | 'ads'>('all');

  // --- Fetch wrapper: auto-refresh on 401 & retry once --
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
          setUsers(normalizeAssignedUsers(json.data));
        } else {
          setError(json.error || 'Failed to load');
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [authFetch]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        user.fullName.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.phone.toLowerCase().includes(normalizedSearch) ||
        user.username.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;

      if (filterBy === 'campaigns') return user.counts.campaigns > 0;
      if (filterBy === 'adsets') return user.counts.adSets > 0;
      if (filterBy === 'ads') return user.counts.ads > 0;
      return true;
    });
  }, [users, normalizedSearch, filterBy]);

  const totals = useMemo(() => {
    return filteredUsers.reduce(
      (acc, user) => {
        acc.campaigns += user.counts.campaigns;
        acc.adSets += user.counts.adSets;
        acc.ads += user.counts.ads;
        return acc;
      },
      { campaigns: 0, adSets: 0, ads: 0 },
    );
  }, [filteredUsers]);

  return (
    <AdminShell>
      <div className="space-y-4 sm:space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-5">
          <h1 className="text-xl font-bold text-gray-900">User Campaign Assignments</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage assigned users and review their campaigns, ad sets, and ads.
          </p>

          <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-[minmax(0,1fr)_200px_110px] sm:gap-2.5">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, email, or username"
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </label>

            <label className="relative block">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as 'all' | 'campaigns' | 'adsets' | 'ads')}
                className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-8 text-sm text-gray-700 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              >
                <option value="all">All Assignments</option>
                <option value="campaigns">Campaign Assigned</option>
                <option value="adsets">Ad Set Assigned</option>
                <option value="ads">Ad Assigned</option>
              </select>
            </label>

            <div className="flex h-11 items-center justify-center rounded-xl border border-green-200 bg-green-50 px-3 text-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700">Users</p>
                <p className="mt-0.5 text-lg font-bold leading-none text-green-700">
                  {loading ? <span className="inline-block h-4 w-8 rounded bg-green-200/90 skeleton-breathe" /> : filteredUsers.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading && <AdminSectionSkeleton variant="grid" />}

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
          <>
            {filteredUsers.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
                <Users className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">No users found with your search or filter.</p>
                <p className="mt-1 text-xs text-gray-400">Try changing search text or filter type.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-200 bg-white">
                <div className="grid grid-cols-3 gap-2 border-b border-gray-100 p-3 sm:p-4">
                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-2 py-2 text-center sm:px-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">Campaigns</p>
                    <p className="mt-0.5 text-base font-bold text-blue-700 sm:text-lg">{totals.campaigns}</p>
                  </div>
                  <div className="rounded-xl border border-purple-200 bg-purple-50 px-2 py-2 text-center sm:px-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-600">Ad Sets</p>
                    <p className="mt-0.5 text-base font-bold text-purple-700 sm:text-lg">{totals.adSets}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-2 text-center sm:px-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Ads</p>
                    <p className="mt-0.5 text-base font-bold text-emerald-700 sm:text-lg">{totals.ads}</p>
                  </div>
                </div>

                <div className="md:hidden space-y-3 p-3">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="rounded-xl border border-gray-200 bg-white p-3">
                      <div className="flex items-start gap-3">
                        {user.avatarUrl ? (
                          <Image src={user.avatarUrl} alt="avatar" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-600">
                            {user.fullName
                              ?.split(' ')
                              .map((w) => w[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase() || '?'}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-900">{user.fullName}</p>
                          {user.phone ? (
                            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </p>
                          ) : null}
                          {user.email ? (
                            <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-gray-500">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="rounded-lg bg-blue-50 px-2 py-1.5 text-center text-[11px] font-medium text-blue-700">
                          {user.counts.campaigns} Campaign
                        </div>
                        <div className="rounded-lg bg-purple-50 px-2 py-1.5 text-center text-[11px] font-medium text-purple-700">
                          {user.counts.adSets} Ad Set
                        </div>
                        <div className="rounded-lg bg-emerald-50 px-2 py-1.5 text-center text-[11px] font-medium text-emerald-700">
                          {user.counts.ads} Ads
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/user-campaigns/${user.id}`}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs uppercase text-gray-500">
                        <th className="px-5 py-3 font-medium">User</th>
                        <th className="px-4 py-3 font-medium">Contact</th>
                        <th className="px-4 py-3 font-medium text-center">Campaigns</th>
                        <th className="px-4 py-3 font-medium text-center">Ad Sets</th>
                        <th className="px-4 py-3 font-medium text-center">Ads</th>
                        <th className="px-4 py-3 font-medium text-center">Total</th>
                        <th className="px-5 py-3 font-medium text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="transition-colors hover:bg-gray-50">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              {user.avatarUrl ? (
                                <Image src={user.avatarUrl} alt="avatar" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                              ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-600">
                                  {user.fullName
                                    ?.split(' ')
                                    .map((w) => w[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase() || '?'}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="truncate font-medium text-gray-900">{user.fullName}</p>
                                <p className="truncate text-xs text-gray-500">@{user.username || 'user'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            <p className="truncate">{user.phone || 'No phone'}</p>
                            <p className="mt-0.5 truncate text-gray-500">{user.email || 'No email'}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-blue-50 px-2 py-1 font-semibold text-blue-700">
                              {user.counts.campaigns}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-purple-50 px-2 py-1 font-semibold text-purple-700">
                              {user.counts.adSets}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                              {user.counts.ads}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-700">
                            {user.counts.total}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <Link
                              href={`/dashboard/user-campaigns/${user.id}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminShell>
  );
}

/* -----------------------------------------------------------------
   User View � Show the logged-in user's own assigned campaigns
   ----------------------------------------------------------------- */

function UserOwnView({ userId }: { userId: string }) {
  const { accessToken, refreshSession } = useAuth();
  const { confirm } = useConfirm();
  const BY_IDS_CHUNK_SIZE = 40;

  // --- Fetch wrapper: auto-refresh on 401 & retry once --
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

  const fetchMetaByIdsChunked = useCallback(async <T,>(
    type: 'CAMPAIGN' | 'ADSET' | 'AD',
    refs: AssignmentRef[],
  ): Promise<T[]> => {
    const ids = Array.from(new Set(refs.map((r) => r.metaObjectId).filter(Boolean)));
    if (ids.length === 0) return [];

    const all: T[] = [];

    for (let i = 0; i < ids.length; i += BY_IDS_CHUNK_SIZE) {
      const chunk = ids.slice(i, i + BY_IDS_CHUNK_SIZE);
      const params = new URLSearchParams({ type, ids: chunk.join(',') });
      const res = await authFetch(`/api/v1/meta/by-ids?${params.toString()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        all.push(...json.data);
      }
    }

    return all;
  }, [authFetch]);

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
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [modalAdSets, setModalAdSets] = useState<AdSet[]>([]);
  const [modalAdsByAdSet, setModalAdsByAdSet] = useState<Record<string, Ad[]>>({});
  const [modalDetailsLoading, setModalDetailsLoading] = useState(false);
  const [modalDetailsError, setModalDetailsError] = useState('');
  const [campaignChildCounts, setCampaignChildCounts] = useState<Record<string, { adSets: number; ads: number }>>({});
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
    let cancelled = false;
    setLoadingCampaigns(true);
    fetchMetaByIdsChunked<Campaign>('CAMPAIGN', campaignRefs)
      .then((data) => { if (!cancelled) setCampaigns(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingCampaigns(false); });
    return () => { cancelled = true; };
  }, [campaignRefs, fetchMetaByIdsChunked]);

  useEffect(() => {
    if (adSetRefs.length === 0) { setAdSets([]); return; }
    let cancelled = false;
    setLoadingAdSets(true);
    fetchMetaByIdsChunked<AdSet>('ADSET', adSetRefs)
      .then((data) => { if (!cancelled) setAdSets(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingAdSets(false); });
    return () => { cancelled = true; };
  }, [adSetRefs, fetchMetaByIdsChunked]);

  useEffect(() => {
    if (adRefs.length === 0) { setAds([]); return; }
    let cancelled = false;
    setLoadingAds(true);
    fetchMetaByIdsChunked<Ad>('AD', adRefs)
      .then((data) => { if (!cancelled) setAds(data); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingAds(false); });
    return () => { cancelled = true; };
  }, [adRefs, fetchMetaByIdsChunked]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        c.name.toLowerCase().includes(normalizedSearch) ||
        (c.objective || '').toLowerCase().includes(normalizedSearch) ||
        (c.status || '').toLowerCase().includes(normalizedSearch) ||
        (c.effective_status || '').toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;
      if (filterStatus === 'all') return true;
      return c.status === filterStatus || c.effective_status === filterStatus;
    });
  }, [campaigns, normalizedSearch, filterStatus]);

  const campaignAccountById = useMemo(
    () => Object.fromEntries(campaignRefs.map((r) => [r.metaObjectId, r.metaAccountId])),
    [campaignRefs],
  );

  const activeCampaignCount = useMemo(
    () => filteredCampaigns.filter((c) => (c.effective_status || c.status || '').toUpperCase() === 'ACTIVE').length,
    [filteredCampaigns],
  );

  const canToggle = (c: Campaign) =>
    ['ACTIVE', 'PAUSED'].includes(c.status) &&
    !['DELETED', 'ARCHIVED'].includes(c.effective_status);

  const toggleStatus = async (campaign: Campaign) => {
    if (!canToggle(campaign)) return;
    const newStatus = campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    const ok = await confirm({
      title: newStatus === 'ACTIVE' ? 'Activate Campaign?' : 'Pause Campaign?',
      message: `Are you sure you want to ${newStatus === 'ACTIVE' ? 'activate' : 'pause'} this campaign?`,
      confirmLabel: newStatus === 'ACTIVE' ? 'Activate' : 'Pause',
    });
    if (!ok) return;

    setTogglingId(campaign.id);
    try {
      const res = await authFetch('/api/v1/meta/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaign.id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaign.id
              ? { ...c, status: newStatus, effective_status: newStatus }
              : c,
          ),
        );
        toast.success(`Campaign ${newStatus === 'ACTIVE' ? 'activated' : 'paused'} successfully`);
      } else {
        toast.error(`Failed: ${json.error}`);
      }
    } catch (e: any) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    if (filteredCampaigns.length === 0) {
      setCampaignChildCounts({});
      return;
    }

    let cancelled = false;

    const loadCampaignChildCounts = async () => {
      const entries = await Promise.all(
        filteredCampaigns.map(async (campaign) => {
          const fallback = {
            adSets: adSets.filter((a) => a.campaign_id === campaign.id).length,
            ads: ads.filter((ad) => ad.campaign_id === campaign.id).length,
          };

          try {
            const accountId = campaignAccountById[campaign.id];
            const counts = await fetchCampaignChildCounts(campaign.id, accountId);
            return [campaign.id, counts] as const;
          } catch {
            return [campaign.id, fallback] as const;
          }
        }),
      );

      if (cancelled) return;
      setCampaignChildCounts(Object.fromEntries(entries));
    };

    loadCampaignChildCounts();

    return () => {
      cancelled = true;
    };
  }, [filteredCampaigns, campaignAccountById, adSets, ads]);

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
        const adSetQuery = new URLSearchParams({ campaign_id: selectedCampaign.id });
        const accountId = campaignAccountById[selectedCampaign.id];
        if (accountId) adSetQuery.set('account_id', accountId);
        const loadedAdSets = await fetchAllMetaPages<AdSet>({
          endpoint: '/api/v1/meta/adsets',
          baseQuery: adSetQuery,
        });
        if (cancelled) return;
        setModalAdSets(loadedAdSets);

        if (loadedAdSets.length === 0) {
          setModalAdsByAdSet({});
          return;
        }

        const adFetches = loadedAdSets.map(async (adSet) => {
          const adsQuery = new URLSearchParams({ adset_id: adSet.id });
          if (accountId) adsQuery.set('account_id', accountId);
          return {
            adSetId: adSet.id,
            ads: await fetchAllMetaPages<Ad>({
              endpoint: '/api/v1/meta/ads',
              baseQuery: adsQuery,
            }),
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

  return (
    <AdminShell>
      <div className="space-y-4 px-3 pt-3 pb-20 sm:space-y-5 sm:px-4 sm:pt-4 sm:pb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 sm:p-5">
          <h1 className="text-xl font-bold text-gray-900">My Campaigns</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Campaigns, ad sets, and ads assigned to you
          </p>

          <div className="mt-3 flex items-center gap-2 sm:mt-4 sm:grid sm:grid-cols-[minmax(0,1fr)_170px_110px] sm:gap-2.5">
            <label className="relative block min-w-0 flex-1 sm:flex-auto">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search campaigns"
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              />
            </label>

            <label className="relative block w-36 shrink-0 sm:w-auto">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-8 text-sm text-gray-700 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROCESS">In Review</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="DISAPPROVED">Disapproved</option>
                <option value="NOT_DELIVERING">Not Delivering</option>
                <option value="COMPLETED">Completed</option>
                <option value="ARCHIVED">Archived</option>
                <option value="DELETED">Deleted</option>
              </select>
            </label>

            <div className="hidden h-11 items-center justify-center rounded-xl border border-green-200 bg-green-50 px-3 text-center sm:flex">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700">Visible</p>
                <p className="mt-0.5 text-lg font-bold leading-none text-green-700">{filteredCampaigns.length}</p>
              </div>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 sm:hidden">
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700">Visible</p>
              <p className="mt-0.5 text-base font-bold leading-none text-green-700">{filteredCampaigns.length}</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">Active</p>
              <p className="mt-0.5 text-base font-bold leading-none text-blue-700">{activeCampaignCount}</p>
            </div>
          </div>

          <div className="mt-2 hidden rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-center sm:block sm:w-28">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-700">Active</p>
            <p className="mt-0.5 text-lg font-bold leading-none text-blue-700">{activeCampaignCount}</p>
          </div>
        </div>

        {/* Loading */}
        {loading && <AdminSectionSkeleton variant="meta" />}

        {/* Error */}
        {error && !loading && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-6 py-10 text-center text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* No assignments at all */}
            {campaignRefs.length === 0 && (
              <div className="rounded-xl border border-gray-100 bg-white px-4 py-10 sm:px-6 sm:py-16 text-center">
                <Megaphone className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm text-gray-500">No campaigns assigned to you yet.</p>
                <p className="mt-1 text-xs text-gray-400">
                  Contact admin to get campaigns, ad sets, or ads assigned.
                </p>
              </div>
            )}

            {/* Campaign only content */}
            {campaignRefs.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
                  <h3 className="text-sm font-semibold text-gray-800">Campaigns</h3>
                </div>

                {loadingCampaigns ? (
                  <Spinner />
                ) : filteredCampaigns.length === 0 ? (
                  <div className="px-6 py-10 text-center text-sm text-gray-500">No campaigns found.</div>
                ) : (
                  <>
                    <div className="space-y-3 p-3 md:hidden">
                      {filteredCampaigns.map((c) => {
                        const st = getStatusStyle(c.effective_status);
                        const thumb = c.ads?.data?.[0]?.creative?.thumbnail_url;
                        const budget = formatBudgetValue(c.daily_budget, c.lifetime_budget);
                        const dateRange = formatShortRange(c.start_time, c.stop_time);
                        const isActive = (c.effective_status || c.status || '').toUpperCase() === 'ACTIVE';
                        const summary = campaignChildCounts[c.id] ?? {
                          adSets: adSets.filter((a) => a.campaign_id === c.id).length,
                          ads: ads.filter((ad) => ad.campaign_id === c.id).length,
                        };

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
                              <div className="flex items-center gap-1.5">
                                <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-600">
                                  {summary.adSets} ad sets
                                </span>
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                                  {summary.ads} ads
                                </span>
                              </div>

                              {canToggle(c) ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    void toggleStatus(c);
                                  }}
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
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="hidden gap-3 p-4 sm:p-5 md:grid md:grid-cols-2 xl:grid-cols-2">
                      {filteredCampaigns.map((c) => {
                        const st = getStatusStyle(c.effective_status);
                        const thumb = c.ads?.data?.[0]?.creative?.thumbnail_url;
                        const budget = formatBudgetValue(c.daily_budget, c.lifetime_budget);
                        const dateRange = formatShortRange(c.start_time, c.stop_time);
                        const isActive = (c.effective_status || c.status || '').toUpperCase() === 'ACTIVE';
                        const summary = campaignChildCounts[c.id] ?? {
                          adSets: adSets.filter((a) => a.campaign_id === c.id).length,
                          ads: ads.filter((ad) => ad.campaign_id === c.id).length,
                        };

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
                              <div className="flex items-center gap-2">
                                <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
                                  {summary.adSets} ad sets
                                </span>
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700">
                                  {summary.ads} ads
                                </span>
                              </div>

                              {canToggle(c) ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    void toggleStatus(c);
                                  }}
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
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {selectedCampaign && createPortal(
          (() => {
            const fallbackAdSets = adSets.filter((a) => a.campaign_id === selectedCampaign.id);
            const relatedAdSets = modalAdSets.length > 0 ? modalAdSets : fallbackAdSets;
            const relatedAdSetIds = new Set(relatedAdSets.map((a) => a.id));
            const modalAds = Object.values(modalAdsByAdSet).flat();
            const fallbackAds = ads.filter((ad) => ad.campaign_id === selectedCampaign.id || relatedAdSetIds.has(ad.adset_id));
            const relatedAds = modalAds.length > 0 ? modalAds : fallbackAds;

            return (
              <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/60 p-3 sm:p-4" onClick={() => setSelectedCampaign(null)}>
                <div
                  className="w-full max-w-[min(1100px,96vw)] max-h-[90vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_28px_90px_-30px_rgba(0,0,0,0.65)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="sticky top-0 z-10 border-b border-gray-100 bg-linear-to-r from-slate-50 via-white to-red-50/60 px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 pr-4">
                        <h3 className="truncate text-base font-semibold text-gray-900 sm:text-lg">{selectedCampaign.name}</h3>
                        <p className="mt-1 text-xs text-gray-500">Campaign ID: {selectedCampaign.id}</p>
                      </div>
                      <button onClick={() => setSelectedCampaign(null)} className="rounded-lg px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[calc(90vh-88px)] overflow-y-auto px-5 py-5 sm:px-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
                          <p className="text-[11px] uppercase tracking-wide text-gray-500">Status</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">{getStatusStyle(selectedCampaign.effective_status).label}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
                          <p className="text-[11px] uppercase tracking-wide text-gray-500">Objective</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">{selectedCampaign.objective?.replace(/_/g, ' ').toLowerCase() || 'N/A'}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
                          <p className="text-[11px] uppercase tracking-wide text-gray-500">Budget</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">{formatBudgetValue(selectedCampaign.daily_budget, selectedCampaign.lifetime_budget)}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
                          <p className="text-[11px] uppercase tracking-wide text-gray-500">Date Range</p>
                          <p className="mt-1 text-sm font-medium text-gray-900">{formatShortRange(selectedCampaign.start_time, selectedCampaign.stop_time)}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-semibold text-gray-900">Ad Sets and Ads</h4>
                        <p className="mt-1 text-xs text-gray-500">All ad sets under this campaign and their ads</p>

                        {(loadingAdSets || loadingAds || modalDetailsLoading) ? (
                          <p className="mt-3 text-xs text-gray-500">Loading ad sets...</p>
                        ) : modalDetailsError ? (
                          <p className="mt-3 text-xs text-red-500">{modalDetailsError}</p>
                        ) : relatedAdSets.length === 0 ? (
                          <p className="mt-3 text-xs text-gray-500">No ad sets found for this campaign.</p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            {relatedAdSets.map((adSet) => (
                              <div key={adSet.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{adSet.name}</p>
                                    <p className="mt-0.5 text-xs text-gray-500">Budget: {formatBudgetValue(adSet.daily_budget, adSet.lifetime_budget)}</p>
                                    <p className="mt-0.5 text-xs text-gray-500">Date: {formatShortRange(adSet.start_time, adSet.end_time)}</p>
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
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })(),
          document.body,
        )}
      </div>
    </AdminShell>
  );
}

/* -----------------------------------------------------------------
   Tab Section Components
   ----------------------------------------------------------------- */

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

/* --- Campaigns Section --- */

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
      {/* Mobile cards */}
      <div className="space-y-3 p-3 md:hidden">
        {campaigns.map((c) => {
          const st = getStatusStyle(c.effective_status);
          const thumb = c.ads?.data?.[0]?.creative?.thumbnail_url;
          const budget = c.daily_budget
            ? `$${(parseInt(c.daily_budget) / 100).toFixed(2)}/day`
            : c.lifetime_budget
              ? `$${(parseInt(c.lifetime_budget) / 100).toFixed(2)} total`
              : '�';
          const start = c.start_time ? new Date(c.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
          const end = c.stop_time ? new Date(c.stop_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Ongoing';

          return (
            <div key={c.id} className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-start gap-3">
                {thumb ? (
                  <img src={thumb} alt={c.name} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">N/A</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{c.name}</p>
                  <p className="mt-0.5 text-[11px] text-gray-500 capitalize">{c.objective?.replace(/_/g, ' ').toLowerCase() || '�'}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${st.color}`}>{st.label}</span>
                    <span className="text-[11px] text-gray-500">{budget}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">{start ? `${start} - ${end}` : '�'}</p>
                </div>
                {canToggle(c) ? (
                  <button
                    onClick={() => toggleStatus(c)}
                    disabled={togglingId === c.id}
                    className={`relative mt-0.5 inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 ${
                      c.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                    } ${togglingId === c.id ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        c.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
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
                  : '�';
              const start = c.start_time ? new Date(c.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
              const end = c.stop_time ? new Date(c.stop_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Ongoing';
              return (
                <tr key={c.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-3">
                    {thumb ? (
                      <img src={thumb} alt={c.name} className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">N/A</div>
                    )}
                  </td>
                  <td className="max-w-50 truncate px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-gray-500">{c.objective?.replace(/_/g, ' ').toLowerCase() || '�'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{budget}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{start ? `${start} � ${end}` : '�'}</td>
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
                      <span className="text-xs text-gray-300">�</span>
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

/* --- Ad Sets Section --- */

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
      {/* Mobile cards */}
      <div className="space-y-3 p-3 md:hidden">
        {adSets.map((a) => {
          const st = getStatusStyle(a.effective_status);
          const budget = a.daily_budget
            ? `$${(parseInt(a.daily_budget) / 100).toFixed(2)}/day`
            : a.lifetime_budget
              ? `$${(parseInt(a.lifetime_budget) / 100).toFixed(2)} total`
              : '�';
          const start = a.start_time ? new Date(a.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
          const end = a.end_time ? new Date(a.end_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Ongoing';

          return (
            <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{a.name}</p>
                  <p className="mt-0.5 text-[11px] text-gray-500 capitalize">{a.optimization_goal?.replace(/_/g, ' ').toLowerCase() || '�'}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${st.color}`}>{st.label}</span>
                    <span className="text-[11px] text-gray-500">{budget}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">{start ? `${start} - ${end}` : '�'}</p>
                </div>
                {canToggleAdSet(a) ? (
                  <button
                    onClick={() => toggleAdSetStatus(a)}
                    disabled={togglingId === a.id}
                    className={`relative mt-0.5 inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 ${
                      a.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                    } ${togglingId === a.id ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        a.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
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
                  : '�';
              const start = a.start_time ? new Date(a.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
              const end = a.end_time ? new Date(a.end_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Ongoing';
              return (
                <tr key={a.id} className="transition-colors hover:bg-gray-50">
                  <td className="max-w-55 truncate px-6 py-3 font-medium text-gray-900">{a.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-gray-500">{a.optimization_goal?.replace(/_/g, ' ').toLowerCase() || '�'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{budget}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{start ? `${start} � ${end}` : '�'}</td>
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
                      <span className="text-xs text-gray-300">�</span>
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

/* --- Ads Section --- */

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
      {/* Mobile cards */}
      <div className="space-y-3 p-3 md:hidden">
        {ads.map((ad) => {
          const st = getStatusStyle(ad.effective_status);
          return (
            <div key={ad.id} className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-start gap-3">
                {ad.creative?.thumbnail_url ? (
                  <img src={ad.creative.thumbnail_url} alt={ad.name} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">N/A</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">{ad.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-gray-500">{ad.creative?.title || 'No creative title'}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${st.color}`}>{st.label}</span>
                    <span className="text-[11px] text-gray-500">
                      {new Date(ad.created_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                {canToggleAd(ad) ? (
                  <button
                    onClick={() => toggleAdStatus(ad)}
                    disabled={togglingId === ad.id}
                    className={`relative mt-0.5 inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 ${
                      ad.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-300'
                    } ${togglingId === ad.id ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        ad.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
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
                      <img src={ad.creative.thumbnail_url} alt={ad.name} className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">N/A</div>
                    )}
                  </td>
                  <td className="max-w-50 truncate px-4 py-3 font-medium text-gray-900">{ad.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.color}`}>{st.label}</span>
                  </td>
                  <td className="max-w-40 truncate px-4 py-3 text-xs text-gray-500">{ad.creative?.title || '�'}</td>
                  <td className="max-w-48 truncate px-4 py-3 text-xs text-gray-500">{ad.creative?.body || '�'}</td>
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
                      <span className="text-xs text-gray-300">�</span>
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
