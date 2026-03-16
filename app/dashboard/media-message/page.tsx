'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminShell from '../_components/AdminShell';
import { Check, Copy, Loader2, Mail, Phone, Server } from 'lucide-react';

interface ContactMessageRow {
  id: string;
  fullName: string;
  email: string;
  companyName: string | null;
  mobile: string;
  queryDetails: string;
  source: string;
  isRead: boolean;
  createdAt: string;
}

const MAILBOX_SETUP_STEPS = [
  'Open your email app and choose Add new account.',
  'Enter your mailbox address.',
  'Enter your mailbox password and sign in.',
  'Enter your mail server settings from the table below.',
];

const MAILBOX_SERVER_SETTINGS = [
  { protocol: 'Incoming server (IMAP)', hostname: 'imap.hostinger.com', port: '993', tls: 'Yes' },
  { protocol: 'Outgoing server (SMTP)', hostname: 'smtp.hostinger.com', port: '465', tls: 'Yes' },
  { protocol: 'Incoming server (POP3)', hostname: 'pop.hostinger.com', port: '995', tls: 'Yes' },
];

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

export default function MediaMessagePage() {
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState('');

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
          const rows = json.data || [];
          setMessages(rows);
          setSelectedMessageId(rows[0]?.id || '');
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

  const selectedMessage = useMemo(() => {
    if (filteredMessages.length === 0) return null;
    return (
      filteredMessages.find((msg) => msg.id === selectedMessageId) ||
      filteredMessages[0]
    );
  }, [filteredMessages, selectedMessageId]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Message</h1>
          <p className="mt-1 text-sm text-gray-500">
            Contact Us form theke asha message gulo ekhane inbox hisebe dekhabe.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-red-100 p-1.5 text-red-600">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Mailbox Inbox</p>
                <p className="text-xs text-gray-500">Protocol: IMAP / SMTP / POP3</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
              <Check className="h-3.5 w-3.5" />
              Active
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, mobile, message"
                className="mb-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
              />

              {loading && (
                <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-3 py-8 text-sm text-gray-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading messages...
                </div>
              )}

              {!loading && error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              {!loading && !error && filteredMessages.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 bg-white px-3 py-8 text-center text-sm text-gray-500">
                  No contact messages found.
                </div>
              )}

              {!loading && !error && filteredMessages.length > 0 && (
                <div className="space-y-2">
                  {filteredMessages.map((msg) => {
                    const isActive = selectedMessage?.id === msg.id;
                    return (
                      <button
                        key={msg.id}
                        type="button"
                        onClick={() => setSelectedMessageId(msg.id)}
                        className={`w-full rounded-xl border px-3 py-2.5 text-left transition-all ${isActive
                          ? 'border-red-200 bg-white shadow-sm'
                          : 'border-transparent bg-white/70 hover:border-gray-200 hover:bg-white'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-gray-800">{msg.fullName}</p>
                          <span className="text-[11px] text-gray-400">{formatDateTime(msg.createdAt)}</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-gray-600">{msg.email}</p>
                        <p className="mt-1 truncate text-xs text-gray-500">{msg.queryDetails}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              {selectedMessage ? (
                <>
                  <div className="border-b border-gray-100 pb-3">
                    <p className="text-base font-semibold text-gray-900">{selectedMessage.fullName}</p>
                    <p className="mt-1 text-xs text-gray-500">{formatDateTime(selectedMessage.createdAt)}</p>
                  </div>

                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
                      <span className="font-semibold">Email:</span> {selectedMessage.email}
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
                      <span className="font-semibold">Company:</span> {selectedMessage.companyName || 'N/A'}
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
                      <span className="font-semibold">Source:</span> {selectedMessage.source}
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gray-500" />
                      <span className="font-semibold">Mobile:</span> {selectedMessage.mobile}
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Message</p>
                    <p className="whitespace-pre-wrap text-sm text-gray-700">{selectedMessage.queryDetails}</p>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                  Select a message to view details.
                </div>
              )}

              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Set up email on your device</p>
                    <Server className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">Add this mailbox to your email app using the steps below.</p>

                  <div className="mt-3 space-y-2">
                    {MAILBOX_SETUP_STEPS.map((step, idx) => (
                      <div key={step} className="flex items-start gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-[11px] font-semibold text-gray-600">
                          {idx + 1}
                        </span>
                        <p className="text-xs text-gray-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 text-left text-gray-600">
                        <th className="px-3 py-2 font-semibold">Protocol</th>
                        <th className="px-3 py-2 font-semibold">Hostname</th>
                        <th className="px-3 py-2 font-semibold">Port</th>
                        <th className="px-3 py-2 font-semibold">TLS/SSL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MAILBOX_SERVER_SETTINGS.map((row) => (
                        <tr key={row.protocol} className="border-t border-gray-100">
                          <td className="px-3 py-2 text-gray-700">{row.protocol}</td>
                          <td className="px-3 py-2 text-gray-700">
                            <div className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1">
                              {row.hostname}
                              <Copy className="h-3 w-3 text-gray-400" />
                            </div>
                          </td>
                          <td className="px-3 py-2 text-gray-700">{row.port}</td>
                          <td className="px-3 py-2 text-gray-700">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-50 text-green-700">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
