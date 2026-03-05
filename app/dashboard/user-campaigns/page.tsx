'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminShell from '../_components/AdminShell';
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
  counts: {
    campaigns: number;
    adSets: number;
    ads: number;
    total: number;
  };
}

export default function UserCampaignsPage() {
  const [users, setUsers] = useState<AssignedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/v1/admin/meta-assignments/users')
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
  }, []);

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Campaign</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            View users who have campaigns, ad sets, or ads assigned to them
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

        {/* Empty */}
        {!loading && !error && users.length === 0 && (
          <div className="rounded-xl border border-gray-100 bg-white px-6 py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No users have any assignments yet.</p>
            <p className="mt-1 text-xs text-gray-400">
              Assign campaigns, ad sets, or ads from the Ads Manager page.
            </p>
          </div>
        )}

        {/* User cards */}
        {!loading && !error && users.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="group rounded-xl border border-gray-100 bg-white p-5 transition-shadow hover:shadow-md"
              >
                {/* User info */}
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">
                    {user.fullName
                      ?.split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || '?'}
                  </div>
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

                {/* Counts */}
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

                {/* View Details */}
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
