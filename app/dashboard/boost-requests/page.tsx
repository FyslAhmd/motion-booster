'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminShell from '../_components/AdminShell';
import { useAuth } from '@/lib/auth/context';
import { Search, Loader2, ChevronLeft, ChevronRight, ExternalLink, User, Calendar, DollarSign, Target } from 'lucide-react';

interface BoostRequestItem {
  id: string;
  language: string;
  postLink: string;
  totalBudget: string;
  dailyBudget: string;
  targetAudience: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    username: string;
    avatarUrl?: string | null;
  };
}

interface PaginatedResponse {
  items: BoostRequestItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BoostRequestsPage() {
  const { accessToken, refreshSession } = useAuth();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selected, setSelected] = useState<BoostRequestItem | null>(null);
  const limit = 15;

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (debouncedSearch) params.set('search', debouncedSearch);
      let res = await fetch(`/api/v1/boost-requests?${params}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      if (res.status === 401) {
        const newToken = await refreshSession();
        if (newToken) {
          res = await fetch(`/api/v1/boost-requests?${params}`, {
            headers: { Authorization: `Bearer ${newToken}` },
          });
        }
      }
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, accessToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <AdminShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Boost Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View all boost form submissions from users
            {data && <span className="ml-1 text-gray-400">({data.total} total)</span>}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, phone, link..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition-all"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">No boost requests found</p>
          <p className="text-sm mt-1">Submissions will appear here when users fill out the boost form in chat.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">User</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Post Link</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Total Budget</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Daily Budget</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Target Audience</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Lang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.items.map(item => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                      onClick={() => setSelected(item)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {item.user.avatarUrl ? (
                            <img src={item.user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(item.user.fullName)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{item.user.fullName}</p>
                            <p className="text-xs text-gray-400">{item.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <a
                          href={item.postLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-blue-600 hover:text-blue-700 hover:underline text-xs flex items-center gap-1 max-w-50 truncate"
                        >
                          {item.postLink.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40)}...
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-900">{item.totalBudget}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-900">{item.dailyBudget}</td>
                      <td className="px-5 py-3.5 text-gray-600 max-w-50 truncate">{item.targetAudience}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">{formatDate(item.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.language === 'bn' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                          {item.language === 'bn' ? 'বাংলা' : 'EN'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {data.items.map(item => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="w-full text-left bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  {item.user.avatarUrl ? (
                    <img src={item.user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(item.user.fullName)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{item.user.fullName}</p>
                    <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.language === 'bn' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                    {item.language === 'bn' ? 'বাংলা' : 'EN'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-400">Total</span>
                    <p className="font-semibold text-gray-900">{item.totalBudget}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <span className="text-gray-400">Daily</span>
                    <p className="font-semibold text-gray-900">{item.dailyBudget}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Page {data.page} of {data.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Boost Request Details</h2>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg"><span className="text-lg leading-none text-gray-400">×</span></button>
            </div>
            <div className="p-6 space-y-5">
              {/* User info */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                {selected.user.avatarUrl ? (
                  <img src={selected.user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {getInitials(selected.user.fullName)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{selected.user.fullName}</p>
                  <p className="text-xs text-gray-500">{selected.user.email}</p>
                  <p className="text-xs text-gray-400">{selected.user.phone}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Facebook Post Link</p>
                    <a href={selected.postLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                      {selected.postLink}
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 bg-green-50 rounded-xl p-3">
                    <DollarSign className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Total Budget</p>
                      <p className="text-sm font-semibold text-gray-900">{selected.totalBudget}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-3">
                    <DollarSign className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Daily Budget</p>
                      <p className="text-sm font-semibold text-gray-900">{selected.dailyBudget}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Target Audience</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selected.targetAudience}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Submitted</p>
                    <p className="text-sm text-gray-700">{formatDate(selected.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">Language</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${selected.language === 'bn' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                      {selected.language === 'bn' ? 'বাংলা (Bangla)' : 'English'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
