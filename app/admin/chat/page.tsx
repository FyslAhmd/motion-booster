'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import AdminShell from '../_components/AdminShell';
import { AdminStore } from '@/lib/admin/store';
import { Search, Send, RefreshCw, AlertTriangle, MessageCircle, User, ArrowLeft, Loader2 } from 'lucide-react';

/* ─── helpers ─────────────────────────────────────────────── */
function getInitials(name: string) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}
function formatTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}
const AVATAR_COLORS = ['bg-red-500','bg-blue-500','bg-green-500','bg-purple-500','bg-orange-500','bg-teal-500'];
function getAvatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

interface Conversation { id: string; title?: string; participants: { user: { name: string; id: string } }[]; messages: Message[]; createdAt: string; updatedAt: string; }
interface Message { id: string; content: string; createdAt: string; sender: { id: string; name: string }; }

/* ─── Component ───────────────────────────────────────────── */
export default function AdminChatPage() {
  const [token, setToken] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /* Pre-fill from admin profile */
  useEffect(() => {
    const p = AdminStore.getProfile();
    setLoginForm({ email: p.email || '', password: p.password || '' });
    // restore session token
    const t = sessionStorage.getItem('mb_admin_chat_token');
    const id = sessionStorage.getItem('mb_admin_chat_id');
    if (t) { setToken(t); if (id) setAdminId(id); }
  }, []);

  /* Auto-fetch when token available */
  useEffect(() => {
    if (token) fetchConversations(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* Scroll to bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.messages]);

  const handleLogin = async () => {
    setLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data?.message || 'Login failed'); return; }
      const t = data.accessToken || data.token;
      const uid = data.user?.id || '';
      sessionStorage.setItem('mb_admin_chat_token', t);
      sessionStorage.setItem('mb_admin_chat_id', uid);
      setToken(t);
      setAdminId(uid);
    } catch {
      setLoginError('Cannot connect to backend. Make sure the server is running.');
    } finally {
      setLoggingIn(false);
    }
  };

  const fetchConversations = useCallback(async (t: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/chat/conversations', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) {
        if (res.status === 401) { setToken(null); sessionStorage.removeItem('mb_admin_chat_token'); return; }
        throw new Error(`Error ${res.status}`);
      }
      const data = await res.json();
      setConversations(Array.isArray(data?.conversations) ? data.conversations : Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError((e as Error).message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = async (convId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/chat/conversations/${convId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const conv = data?.conversation || data;
      setSelected(conv);
    } catch {}
  };

  const sendReply = async () => {
    if (!selected || !replyText.trim() || !token) return;
    setSending(true);
    try {
      const res = await fetch(`/api/v1/chat/conversations/${selected.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: replyText.trim() }),
      });
      if (res.ok) {
        setReplyText('');
        await fetchMessages(selected.id);
      }
    } catch {} finally { setSending(false); }
  };

  const logout = () => {
    setToken(null); setAdminId(null); setConversations([]); setSelected(null);
    sessionStorage.removeItem('mb_admin_chat_token');
    sessionStorage.removeItem('mb_admin_chat_id');
  };

  const filtered = conversations.filter(c => {
    const name = c.participants?.find(p => p.user.id !== adminId)?.user.name || c.title || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  /* ── Not logged in ── */
  if (!token) {
    return (
      <AdminShell>
        <div className="max-w-sm mx-auto mt-16 bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Connect to Chat</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in with your backend admin account to view messages</p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {loginError}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loggingIn}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loggingIn ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</> : 'Connect to Chat'}
            </button>
          </div>
        </div>
      </AdminShell>
    );
  }

  /* ── Main Chat UI ── */
  return (
    <AdminShell>
      <div className="flex flex-col h-[calc(100vh-120px)] min-h-[500px]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chat Messages</h1>
            <p className="text-sm text-gray-500">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => token && fetchConversations(token)}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={logout} className="text-xs text-gray-500 hover:text-red-600 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Disconnect
            </button>
          </div>
        </div>

        <div className="flex flex-1 gap-4 min-h-0">
          {/* Conversation List */}
          <div className={`${selected ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-72 lg:w-80 shrink-0 bg-white rounded-2xl border border-gray-100 overflow-hidden`}>
            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              )}
              {error && (
                <div className="p-4 text-center">
                  <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              {!loading && !error && filtered.length === 0 && (
                <div className="p-6 text-center text-gray-400">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No conversations found</p>
                </div>
              )}
              {filtered.map(conv => {
                const other = conv.participants?.find(p => p.user.id !== adminId)?.user;
                const name = other?.name || conv.title || 'Unknown';
                const last = conv.messages?.[conv.messages.length - 1];
                const isActive = selected?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => { setSelected(conv); fetchMessages(conv.id); }}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${isActive ? 'bg-blue-50' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(name)}`}>
                      {getInitials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                        <p className="text-xs text-gray-400 shrink-0 ml-2">{formatTime(conv.updatedAt)}</p>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{last?.content || 'No messages yet'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Panel */}
          <div className={`${selected ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden min-w-0`}>
            {selected ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                  <button onClick={() => setSelected(null)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100">
                    <ArrowLeft className="w-4 h-4 text-gray-500" />
                  </button>
                  {(() => {
                    const other = selected.participants?.find(p => p.user.id !== adminId)?.user;
                    const name = other?.name || selected.title || 'Unknown';
                    return (
                      <>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${getAvatarColor(name)}`}>
                          {getInitials(name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{name}</p>
                          <p className="text-xs text-gray-400">{selected.messages?.length || 0} messages</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {(selected.messages || []).map(msg => {
                    const isAdmin = msg.sender?.id === adminId;
                    return (
                      <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        {!isAdmin && (
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 self-end ${getAvatarColor(msg.sender?.name || '')}`}>
                            {getInitials(msg.sender?.name || '?')}
                          </div>
                        )}
                        <div className={`max-w-[70%] ${isAdmin ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'} rounded-2xl ${isAdmin ? 'rounded-br-sm' : 'rounded-bl-sm'} px-4 py-2.5`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isAdmin ? 'text-blue-200' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply */}
                <div className="p-3 border-t border-gray-100">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                      placeholder="Type a reply... (Enter to send)"
                      rows={2}
                      className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={sendReply}
                      disabled={!replyText.trim() || sending}
                      className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 shrink-0"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-gray-400 p-8">
                <div>
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
