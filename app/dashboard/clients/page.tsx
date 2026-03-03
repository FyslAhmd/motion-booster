'use client';

import { useState, useEffect, useMemo } from 'react';
import AdminShell from '../_components/AdminShell';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldOff,
  Ban,
  Megaphone,
  MegaphoneOff,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react';

interface Client {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  adsAccess: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<Client['status'], { label: string; cls: string; icon: typeof ShieldCheck }> = {
  ACTIVE:    { label: 'Active',    cls: 'bg-green-50 text-green-700 border border-green-200',  icon: ShieldCheck },
  SUSPENDED: { label: 'Suspended', cls: 'bg-amber-50 text-amber-700 border border-amber-200',  icon: ShieldOff },
  BANNED:    { label: 'Banned',    cls: 'bg-red-50 text-red-600 border border-red-200',         icon: Ban },
};

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtTime(iso: string | null) {
  if (!iso) return 'Never';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/clients');
      const json = await res.json();
      if (json.success) setClients(json.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(c =>
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.username.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  }, [clients, search]);

  async function patch(id: string, payload: Partial<Pick<Client, 'status' | 'adsAccess'>>) {
    setUpdating(id);
    try {
      const res = await fetch('/api/v1/admin/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload }),
      });
      const json = await res.json();
      if (json.success) {
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...json.data } : c));
      }
    } catch {}
    finally { setUpdating(null); }
  }

  function cycleStatus(client: Client) {
    const next: Record<Client['status'], Client['status']> = {
      ACTIVE: 'SUSPENDED',
      SUSPENDED: 'BANNED',
      BANNED: 'ACTIVE',
    };
    patch(client.id, { status: next[client.status] });
  }

  return (
    <AdminShell>
      <div className="p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              Clients
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? 'Loading…' : `${clients.length} registered client${clients.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search clients…"
                className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-400 w-56"
              />
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total',     value: clients.length,                                          cls: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Active',    value: clients.filter(c => c.status === 'ACTIVE').length,       cls: 'text-green-600',  bg: 'bg-green-50' },
            { label: 'Suspended', value: clients.filter(c => c.status === 'SUSPENDED').length,    cls: 'text-amber-600',  bg: 'bg-amber-50' },
            { label: 'Ads Access',value: clients.filter(c => c.adsAccess).length,                 cls: 'text-red-600',    bg: 'bg-red-50' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                <span className={`text-sm font-bold ${s.cls}`}>{s.value}</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
              <span className="text-sm">Loading clients…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Users className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">{search ? 'No clients match your search.' : 'No clients yet.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ads Access</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Login</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(client => {
                    const st = STATUS_STYLES[client.status];
                    const StIcon = st.icon;
                    const busy = updating === client.id;
                    return (
                      <tr key={client.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Client */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {client.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{client.fullName}</p>
                              <p className="text-[11px] text-gray-400 truncate">@{client.username}</p>
                            </div>
                            {client.emailVerified ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" title="Email verified" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-gray-300 shrink-0" title="Email not verified" />
                            )}
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3">
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 truncate">
                              <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate">{client.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Phone className="w-3 h-3 shrink-0" />
                              <span>{client.phone || '—'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => cycleStatus(client)}
                            disabled={busy}
                            title="Click to change status"
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-50 ${st.cls}`}
                          >
                            {busy ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <StIcon className="w-3 h-3" />
                            )}
                            {st.label}
                          </button>
                        </td>

                        {/* Ads Access */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => patch(client.id, { adsAccess: !client.adsAccess })}
                            disabled={busy}
                            title={client.adsAccess ? 'Revoke Ads Access' : 'Grant Ads Access'}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-50 ${
                              client.adsAccess
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : 'bg-gray-100 text-gray-400 border border-gray-200'
                            }`}
                          >
                            {client.adsAccess ? <Megaphone className="w-3 h-3" /> : <MegaphoneOff className="w-3 h-3" />}
                            {client.adsAccess ? 'Enabled' : 'Disabled'}
                          </button>
                        </td>

                        {/* Last Login */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span className="truncate">{fmtTime(client.lastLoginAt)}</span>
                          </div>
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {fmtDate(client.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
