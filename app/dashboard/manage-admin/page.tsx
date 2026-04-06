'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback, Fragment } from 'react';
import AdminShell from '../_components/AdminShell';
import { useConfirm } from '@/lib/admin/confirm';
import { toast } from 'sonner';
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

function Pulse({ className }: { className: string }) {
  return <div className={`skeleton-breathe rounded-xl bg-gray-200/80 ${className}`} />;
}

function ClientsStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Pulse className="h-8 w-8 rounded-lg" />
            <div className="space-y-2">
              <Pulse className="h-3 w-12" />
              <Pulse className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClientsCardsSkeleton() {
  return (
    <>
      <div className="divide-y divide-gray-100 sm:hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2.5 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Pulse className="h-9 w-9 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Pulse className="h-3.5 w-2/5" />
                <Pulse className="h-3 w-1/3" />
              </div>
              <Pulse className="h-7 w-14 rounded-lg" />
            </div>
            <div className="space-y-1 pl-12">
              <Pulse className="h-3 w-3/4" />
              <Pulse className="h-3 w-2/5" />
            </div>
            <div className="flex flex-wrap items-center gap-2 pl-12">
              <Pulse className="h-5 w-20 rounded-full" />
              <Pulse className="h-5 w-18 rounded-full" />
              <Pulse className="h-5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden px-4 py-4 sm:block sm:px-6">
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Pulse className="h-9 w-9 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Pulse className="h-4 w-2/5" />
                <Pulse className="h-3 w-3/5" />
              </div>
              <Pulse className="h-6 w-20 rounded-full" />
              <Pulse className="h-6 w-20 rounded-full" />
              <Pulse className="h-7 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
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

  const { confirm } = useConfirm();

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (form.newPassword && form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (!await confirm({ title: 'Save Changes', message: 'Are you sure you want to save admin changes?' })) return;
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {
        id: client.id,
        fullName: form.fullName,
        status: form.status,
        emailVerified: form.emailVerified,
      };
      if (form.adsAccess !== client.adsAccess) payload.adsAccess = form.adsAccess;
      if (form.newPassword) payload.newPassword = form.newPassword;
      const res = await fetch('/api/v1/admin/manage-admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        onSave(json.data);
        toast.success('Admin changes saved successfully!');
      } else {
        setError(json.error || 'Failed to save');
        toast.error(json.error || 'Failed to save admin changes');
      }
    } catch {
      setError('Network error');
      toast.error('Network error while saving admin changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Edit Admin</h2>
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

            {/* Email */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Email (read only)</label>
              <input
                type="email"
                value={client.email}
                readOnly
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Phone (read only)</label>
              <input
                value={client.phone}
                readOnly
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
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

/* ─── Main Page ───────────────────────────────────────── */

export default function ManageAdminPage() {
  const [clients, setClients]       = useState<Client[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [counts, setCounts]         = useState({ total: 0, active: 0, suspended: 0, banned: 0 });
  const [updating, setUpdating]     = useState<string | null>(null);
  const { confirm } = useConfirm();

  // Edit / Delete modals
  const [editClient, setEditClient]     = useState<Client | null>(null);

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
      const res  = await fetch(`/api/v1/admin/manage-admin?${params}`);
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
      const res  = await fetch('/api/v1/admin/manage-admin', {
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

  async function handleDeleteClient(client: Client) {
    const ok = await confirm({
      title: 'Delete Admin',
      message: `Are you sure you want to delete ${client.fullName}? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    });
    if (!ok) return;

    setUpdating(client.id);
    try {
      const res = await fetch('/api/v1/admin/manage-admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: client.id }),
      });
      const json = await res.json();
      if (json.success) {
        setClients((prev) => prev.filter((c) => c.id !== client.id));
        load(page, debouncedSearch);
        toast.success('Admin deleted successfully!');
      } else {
        toast.error(json.error || 'Failed to delete admin');
      }
    } catch {
      toast.error('Network error while deleting admin');
    } finally {
      setUpdating(null);
    }
  }

  return (
    <AdminShell>
      <div className="p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              Manage Admin
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {loading ? (
                <span className="inline-block h-3 w-40 skeleton-breathe rounded-full bg-gray-200" />
              ) : (
                `${clients.length} registered admin${clients.length !== 1 ? 's' : ''}`
              )}
            </p>
          </div>
          <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search admins…"
                className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 sm:w-56"
              />
            </div>
            <button
              onClick={() => load(page, debouncedSearch)}
              disabled={loading}
              className="rounded-xl border border-gray-200 bg-white p-2 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats row */}
        {loading ? (
          <ClientsStatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total',     value: counts.total,      cls: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Active',    value: counts.active,     cls: 'text-green-600',  bg: 'bg-green-50' },
              { label: 'Suspended', value: counts.suspended,  cls: 'text-amber-600',  bg: 'bg-amber-50' },
              { label: 'Banned',    value: counts.banned,     cls: 'text-red-600',    bg: 'bg-red-50' },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-4 flex items-center gap-3 shadow-sm">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                  <span className={`text-sm font-bold ${s.cls}`}>{s.value}</span>
                </div>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <ClientsCardsSkeleton />
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Users className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">{debouncedSearch ? 'No admins match your search.' : 'No admins yet.'}</p>
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
                          <button
                            onClick={() => handleDeleteClient(client)}
                            disabled={busy}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
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

	              {/* ── Desktop cards (hidden on mobile) ── */}
	              <div className="hidden sm:grid grid-cols-1 gap-3 p-4 sm:p-5 lg:grid-cols-2 xl:grid-cols-3">
	                {clients.map(client => {
	                  const st = STATUS_STYLES[client.status];
	                  const StIcon = st.icon;
	                  const busy = updating === client.id;
	                  return (
	                    <div key={client.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
	                      <div className="flex items-center gap-3">
	                        {client.avatarUrl ? (
	                          <Image src={client.avatarUrl} alt="avatar" width={40} height={40} className="w-10 h-10 rounded-full object-cover shrink-0" />
	                        ) : (
	                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
	                            {client.fullName.slice(0, 2).toUpperCase()}
	                          </div>
	                        )}
	                        <div className="min-w-0 flex-1">
	                          <p className="font-semibold text-gray-900 text-sm truncate">{client.fullName}</p>
	                          <p className="text-[11px] text-gray-400 truncate">@{client.username}</p>
	                        </div>
	                        <div className="flex items-center gap-1 shrink-0">
	                          <button onClick={() => setEditClient(client)} title="Edit admin" className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
	                            <Pencil className="w-3.5 h-3.5" />
	                          </button>
	                          <button
                              onClick={() => handleDeleteClient(client)}
                              disabled={busy}
                              title="Delete admin"
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
	                            <Trash2 className="w-3.5 h-3.5" />
	                          </button>
	                        </div>
	                      </div>

	                      <div className="mt-3 space-y-1.5">
	                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
	                          <Mail className="w-3 h-3 text-gray-400 shrink-0" />
	                          <span className="truncate">{client.email}</span>
	                        </div>
	                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
	                          <Phone className="w-3 h-3 shrink-0" />
	                          <span>{client.phone || '—'}</span>
	                        </div>
	                      </div>

	                      <div className="mt-3 flex flex-wrap items-center gap-2">
	                        <button
	                          onClick={() => cycleStatus(client)}
	                          disabled={busy}
	                          title="Click to change status"
	                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-50 ${st.cls}`}
	                        >
	                          {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <StIcon className="w-3 h-3" />}
	                          {st.label}
	                        </button>

	                        <button
	                          onClick={() => patch(client.id, { adsAccess: !client.adsAccess })}
	                          disabled={busy}
	                          title={client.adsAccess ? 'Revoke Ads Access' : 'Grant Ads Access'}
	                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-opacity hover:opacity-70 disabled:opacity-50 ${
	                            client.adsAccess ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-400 border border-gray-200'
	                          }`}
	                        >
	                          {client.adsAccess ? <Megaphone className="w-3 h-3" /> : <MegaphoneOff className="w-3 h-3" />}
	                          {client.adsAccess ? 'Ads On' : 'No Ads'}
	                        </button>

	                        {client.emailVerified ? (
	                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-green-50 text-green-600 border border-green-200">
	                            <CheckCircle2 className="w-3 h-3" /> Verified
	                          </span>
	                        ) : (
	                          <button
	                            onClick={() => patch(client.id, { emailVerified: true })}
	                            disabled={busy}
	                            className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition-opacity hover:opacity-70 disabled:opacity-50"
	                          >
	                            {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
	                            Verify
	                          </button>
	                        )}
	                      </div>

	                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-gray-500">
	                        <div className="rounded-lg bg-gray-50 px-2 py-2">
	                          <p className="text-gray-400">Last login</p>
	                          <p className="mt-0.5 text-gray-600">{fmtTime(client.lastLoginAt)}</p>
	                        </div>
	                        <div className="rounded-lg bg-gray-50 px-2 py-2">
	                          <p className="text-gray-400">Joined</p>
	                          <p className="mt-0.5 text-gray-600">{fmtDate(client.createdAt)}</p>
	                        </div>
	                      </div>
	                    </div>
	                  );
	                })}
	              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 px-4 py-3">
                  <p className="text-xs text-gray-400">
                    Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} admins
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

    </AdminShell>
  );
}
