'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback, Fragment } from 'react';
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
  Pencil,
  Trash2,
  X,
  Save,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Client {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  adsAccess: boolean;
  emailVerified: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string | null;
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

/* ─── Edit Modal ──────────────────────────────────────── */

interface EditModalProps {
  client: Client;
  onClose: () => void;
  onSave: (updated: Client) => void;
}

function EditModal({ client, onClose, onSave }: EditModalProps) {
  const [form, setForm] = useState({
    fullName: client.fullName,
    username: client.username,
    email: client.email,
    phone: client.phone,
    status: client.status,
    adsAccess: client.adsAccess,
    emailVerified: client.emailVerified,
    newPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const set = (key: string, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.username.trim() || !form.email.trim()) {
      setError('Full name, username, and email are required.');
      return;
    }
    if (form.newPassword && form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = { id: client.id, ...form };
      if (!form.newPassword) delete payload.newPassword;
      const res = await fetch('/api/v1/admin/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        onSave(json.data);
      } else {
        setError(json.error || 'Failed to save');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8" onClick={onClose}>
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Edit Client</h2>
            <p className="mt-0.5 text-xs text-gray-400">ID: {client.id}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Full Name</label>
              <input
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            {/* Username */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Username</label>
              <input
                value={form.username}
                onChange={(e) => set('username', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>

            {/* New Password */}
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-gray-500">
                New Password <span className="text-gray-400 font-normal">(leave blank to keep unchanged)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={(e) => set('newPassword', e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-9 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="flex flex-col gap-3 pt-1">
              {/* <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
                <button
                  type="button"
                  onClick={() => set('adsAccess', !form.adsAccess)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    form.adsAccess ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    form.adsAccess ? 'translate-x-4' : 'translate-x-1'
                  }`} />
                </button>
                Ads Access
              </label> */}

              <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
                <button
                  type="button"
                  onClick={() => set('emailVerified', !form.emailVerified)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    form.emailVerified ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    form.emailVerified ? 'translate-x-4' : 'translate-x-1'
                  }`} />
                </button>
                Email Verified
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal ────────────────────────────── */

interface DeleteModalProps {
  client: Client;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

function DeleteModal({ client, onClose, onDeleted }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const res = await fetch('/api/v1/admin/clients', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: client.id }),
      });
      const json = await res.json();
      if (json.success) {
        onDeleted(client.id);
      } else {
        setError(json.error || 'Failed to delete');
      }
    } catch {
      setError('Network error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <Trash2 className="h-5 w-5 text-red-500" />
          </div>
          <h3 className="text-base font-bold text-gray-900">Delete Client</h3>
          <p className="mt-1.5 text-sm text-gray-500">
            Are you sure you want to delete <span className="font-semibold text-gray-700">{client.fullName}</span>?
            This will permanently remove their account, messages, and all related data.
          </p>
          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}
        </div>
        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ───────────────────────────────────────── */

export default function ClientsPage() {
  const [clients, setClients]       = useState<Client[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [counts, setCounts]         = useState({ total: 0, active: 0, suspended: 0, adsAccess: 0 });
  const [updating, setUpdating]     = useState<string | null>(null);

  // Edit / Delete modals
  const [editClient, setEditClient]     = useState<Client | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);

  // Debounce search — reset to page 1 when query changes
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async (pg: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pg), search: q });
      const res  = await fetch(`/api/v1/admin/clients?${params}`);
      const json = await res.json();
      if (json.success) {
        setClients(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
        setCounts(json.counts);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(page, debouncedSearch); }, [page, debouncedSearch, load]);

  async function patch(id: string, payload: Partial<Pick<Client, 'status' | 'adsAccess' | 'emailVerified'>>) {
    setUpdating(id);
    try {
      const res  = await fetch('/api/v1/admin/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...payload }),
      });
      const json = await res.json();
      if (json.success) {
        setClients(prev => prev.map(c => c.id === id ? { ...c, ...json.data } : c));
        // refresh global counts
        load(page, debouncedSearch);
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
              onClick={() => load(page, debouncedSearch)}
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
            { label: 'Total',     value: counts.total,      cls: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Active',    value: counts.active,     cls: 'text-green-600',  bg: 'bg-green-50' },
            { label: 'Suspended', value: counts.suspended,  cls: 'text-amber-600',  bg: 'bg-amber-50' },
            { label: 'Ads Access',value: counts.adsAccess,  cls: 'text-red-600',    bg: 'bg-red-50' },
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
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Users className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">{debouncedSearch ? 'No clients match your search.' : 'No clients yet.'}</p>
            </div>
          ) : (
            <div>
              {/* ── Mobile card list (hidden on sm+) ── */}
              <div className="divide-y divide-gray-100 sm:hidden">
                {clients.map(client => {
                  const st = STATUS_STYLES[client.status];
                  const StIcon = st.icon;
                  const busy = updating === client.id;
                  return (
                    <div key={client.id} className="px-4 py-3.5 space-y-2.5">
                      {/* Row 1: avatar + name + actions */}
                      <div className="flex items-center gap-3">
                        {client.avatarUrl ? (
                          <Image src={client.avatarUrl} alt="avatar" width={36} height={36} className="w-9 h-9 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {client.fullName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{client.fullName}</p>
                          <p className="text-[11px] text-gray-400 truncate">@{client.username}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => setEditClient(client)} className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteClient(client)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Row 2: email + phone */}
                      <div className="space-y-0.5 pl-12">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Row 3: badges */}
                      <div className="flex flex-wrap items-center gap-2 pl-12">
                        {/* Status */}
                        <button onClick={() => cycleStatus(client)} disabled={busy} title="Click to change status"
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-50 ${st.cls}`}>
                          {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <StIcon className="w-3 h-3" />}
                          {st.label}
                        </button>

                        {/* Ads Access */}
                        <button onClick={() => patch(client.id, { adsAccess: !client.adsAccess })} disabled={busy}
                          title={client.adsAccess ? 'Revoke Ads Access' : 'Grant Ads Access'}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-50 ${
                            client.adsAccess ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-400 border border-gray-200'
                          }`}>
                          {client.adsAccess ? <Megaphone className="w-3 h-3" /> : <MegaphoneOff className="w-3 h-3" />}
                          {client.adsAccess ? 'Ads On' : 'No Ads'}
                        </button>

                        {/* Email verified */}
                        {client.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-green-600">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <button onClick={() => patch(client.id, { emailVerified: true })} disabled={busy}
                            className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition-opacity hover:opacity-70 disabled:opacity-50">
                            {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                            Unverified
                          </button>
                        )}

                        {/* Last login */}
                        <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
                          <Clock className="w-3 h-3" />{fmtTime(client.lastLoginAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Desktop table (hidden on mobile) ── */}
              <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-225 text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    {/* <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ads Access</th> */}
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Verified</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Login</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {clients.map(client => {
                    const st = STATUS_STYLES[client.status];
                    const StIcon = st.icon;
                    const busy = updating === client.id;
                    return (
                      <tr key={client.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Client */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {client.avatarUrl ? (
                              <Image src={client.avatarUrl} alt="avatar" width={36} height={36} className="w-9 h-9 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {client.fullName.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{client.fullName}</p>
                              <p className="text-[11px] text-gray-400 truncate">@{client.username}</p>
                            </div>
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
                        {/* <td className="px-4 py-3">
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
                        </td> */}

                        {/* Email Verified */}
                        <td className="px-4 py-3">
                          {client.emailVerified ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : (
                            <button
                              onClick={() => patch(client.id, { emailVerified: true })}
                              disabled={busy}
                              title="Click to verify this email"
                              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition-opacity hover:opacity-70 disabled:opacity-50"
                            >
                              {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                              Verify
                            </button>
                          )}
                        </td>

                        {/* Last Login */}
                        <td className="px-4 py-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span className="truncate">{fmtTime(client.lastLoginAt)}</span>
                            </div>
                            {client.lastLoginIp && (
                              <p className="text-[10px] text-gray-300 pl-4.5">IP: {client.lastLoginIp}</p>
                            )}
                          </div>
                        </td>

                        {/* Joined */}
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-400">{fmtDate(client.createdAt)}</p>
                          {client.updatedAt !== client.createdAt && (
                            <p className="text-[10px] text-gray-300 mt-0.5">Updated {fmtDate(client.updatedAt)}</p>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setEditClient(client)}
                              title="Edit client"
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteClient(client)}
                              title="Delete client"
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
                  <p className="text-xs text-gray-400">
                    Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} clients
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1 || loading}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === '...' ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-400">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p as number)}
                            disabled={loading}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40 ${
                              page === p
                                ? 'border-red-400 bg-red-500 text-white'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )
                    }
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages || loading}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editClient && (
        <EditModal
          client={editClient}
          onClose={() => setEditClient(null)}
          onSave={(updated) => {
            setClients((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
            setEditClient(null);
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteClient && (
        <DeleteModal
          client={deleteClient}
          onClose={() => setDeleteClient(null)}
          onDeleted={(id) => {
            setClients((prev) => prev.filter((c) => c.id !== id));
            setDeleteClient(null);
          }}
        />
      )}
    </AdminShell>
  );
}
