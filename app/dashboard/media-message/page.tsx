'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { Check, Mail, MessageCircle, Phone, Search, X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ContactMessageRow {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  companyName: string | null;
  mobile: string;
  queryDetails: string;
  source: string;
  isRead: boolean;
  createdAt: string;
}

function formatDateTime(value: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function MediaMessagePage() {
  const [activeChannel, setActiveChannel] = useState<'mailbox' | 'whatsapp' | 'messenger'>('mailbox');
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeMessage, setActiveMessage] = useState<ContactMessageRow | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch('/api/v1/admin/contact-messages?limit=200', {
          method: 'GET',
          credentials: 'include',
        });
        const json = (await res.json()) as { success?: boolean; error?: string; data?: ContactMessageRow[] };

        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to load contact messages');
        }

        if (!cancelled) {
          setMessages(json.data || []);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load contact messages');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMessages = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter((msg) => {
      return (
        msg.fullName.toLowerCase().includes(q) ||
        msg.email.toLowerCase().includes(q) ||
        msg.mobile.toLowerCase().includes(q) ||
        msg.queryDetails.toLowerCase().includes(q)
      );
    });
  }, [messages, search]);

  return (
    <AdminShell>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Message</h1>
          <p className="mt-1 text-sm text-gray-500">
            Contact Us form theke asha message gulo card hisebe dekhabe. Card e click korle details modal open hobe.
          </p>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white/95 p-2.5 sm:p-5">
          <div className="mb-3 grid grid-cols-3 gap-1.5 sm:mb-4 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveChannel('mailbox')}
              className={`flex items-center justify-center rounded-xl border px-2 py-2.5 text-center transition-colors sm:rounded-2xl sm:px-3 sm:py-3 ${
                activeChannel === 'mailbox'
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <span className={`hidden rounded-lg p-1.5 sm:inline-flex ${activeChannel === 'mailbox' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                  <Mail className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-center text-xs font-semibold text-gray-900 sm:text-sm">Mailbox</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveChannel('whatsapp')}
              className={`flex items-center justify-center rounded-xl border px-2 py-2.5 text-center transition-colors sm:rounded-2xl sm:px-3 sm:py-3 ${
                activeChannel === 'whatsapp'
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <span className={`hidden rounded-lg p-1.5 sm:inline-flex ${activeChannel === 'whatsapp' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-center text-xs font-semibold text-gray-900 sm:text-sm">WhatsApp</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveChannel('messenger')}
              className={`flex items-center justify-center rounded-xl border px-2 py-2.5 text-center transition-colors sm:rounded-2xl sm:px-3 sm:py-3 ${
                activeChannel === 'messenger'
                  ? 'border-sky-200 bg-sky-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <span className={`hidden rounded-lg p-1.5 sm:inline-flex ${activeChannel === 'messenger' ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-600'}`}>
                  <MessageCircle className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-center text-xs font-semibold text-gray-900 sm:text-sm">Messenger</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-4">
            {activeChannel !== 'mailbox' ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-14 text-center">
                <p className="text-base font-semibold text-gray-800">
                  {activeChannel === 'whatsapp' ? 'WhatsApp' : 'Messenger'} Integration
                </p>
                <p className="mt-1 text-sm text-gray-500">Coming Soon</p>
              </div>
            ) : (
              <>
                <div className="relative mb-3 sm:mb-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, email, mobile, message"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>

                {loading && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="skeleton-breathe h-9 w-9 shrink-0 rounded-xl bg-gray-200/80" />
                            <div className="min-w-0 space-y-2">
                              <span className="skeleton-breathe block h-3.5 w-24 rounded-lg bg-gray-200/80" />
                              <span className="skeleton-breathe block h-3 w-32 rounded-lg bg-gray-200/70" />
                            </div>
                          </div>
                          <span className="skeleton-breathe h-5 w-16 shrink-0 rounded-full bg-gray-200/70" />
                        </div>
                        <div className="mt-3 rounded-xl bg-gray-50 px-3 py-2">
                          <span className="skeleton-breathe block h-3 w-full rounded-lg bg-gray-200/70" />
                          <span className="skeleton-breathe mt-2 block h-3 w-4/5 rounded-lg bg-gray-200/70" />
                        </div>
                        <span className="skeleton-breathe mt-2 block h-3 w-28 rounded-lg bg-gray-200/70" />
                      </div>
                    ))}
                  </div>
                )}

                {!loading && error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700">
                    {error}
                  </div>
                )}

                {!loading && !error && filteredMessages.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-3 py-10 text-center text-sm text-gray-500">
                    No contact messages found.
                  </div>
                )}

                {!loading && !error && filteredMessages.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredMessages.map((msg) => (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() => setActiveMessage(msg)}
                        className="rounded-2xl border border-gray-100 bg-white p-3 sm:p-4 text-left transition-all hover:border-red-200 hover:bg-red-50/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            {msg.avatarUrl?.trim() ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={msg.avatarUrl} alt={msg.fullName} className="h-9 w-9 shrink-0 rounded-xl object-cover" />
                            ) : (
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-red-500 to-pink-500 text-xs font-bold text-white">
                                {getInitials(msg.fullName)}
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">{msg.fullName}</p>
                              <p className="truncate text-xs text-gray-500">{msg.email}</p>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full bg-gray-50 px-2 py-1 text-[10px] font-semibold text-gray-500">
                            {msg.source.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="mt-3 line-clamp-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">{msg.queryDetails}</p>
                        <p className="mt-2 text-[11px] text-gray-400">{formatDateTime(msg.createdAt)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {mounted && activeMessage && createPortal(
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-white/75 p-4 backdrop-blur-[1px]" onClick={() => setActiveMessage(null)}>
          <div className="w-full max-w-2xl rounded-3xl border border-gray-200 bg-linear-to-b from-white via-white to-rose-50/50 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex min-w-0 items-center gap-2.5">
                {activeMessage.avatarUrl?.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={activeMessage.avatarUrl} alt={activeMessage.fullName} className="h-10 w-10 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-red-500 to-pink-500 text-xs font-bold text-white">
                    {getInitials(activeMessage.fullName)}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-gray-900">{activeMessage.fullName}</p>
                  <p className="mt-1 text-xs text-gray-500">{formatDateTime(activeMessage.createdAt)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveMessage(null)}
                className="rounded-full border border-gray-200 bg-white p-1.5 text-gray-500 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
              <div className="rounded-xl border border-sky-100 bg-linear-to-br from-sky-50 to-white px-3 py-2.5 text-gray-700">
                <span className="font-semibold">Email:</span> {activeMessage.email}
              </div>
              <div className="rounded-xl border border-violet-100 bg-linear-to-br from-violet-50 to-white px-3 py-2.5 text-gray-700">
                <span className="font-semibold">Company:</span> {activeMessage.companyName || 'N/A'}
              </div>
              <div className="rounded-xl border border-amber-100 bg-linear-to-br from-amber-50 to-white px-3 py-2.5 text-gray-700">
                <span className="font-semibold">Source:</span> {activeMessage.source}
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-white px-3 py-2.5 text-gray-700">
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-semibold">Mobile:</span> {activeMessage.mobile}
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-rose-100 bg-linear-to-br from-white to-rose-50 p-3.5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Message</p>
              <p className="whitespace-pre-wrap text-sm text-gray-700">{activeMessage.queryDetails}</p>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </AdminShell>
  );
}
