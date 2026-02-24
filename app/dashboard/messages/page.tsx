'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useSocket, type ChatMessage } from '@/lib/chat/use-socket';
import {
  Search,
  Send,
  ArrowLeft,
  CheckCheck,
  Check,
  MessageSquarePlus,
  Loader2,
  WifiOff,
  Wifi,
  Circle,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────

interface Participant {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

interface ConversationItem {
  id: string;
  participant: Participant;
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    sender: { id: string; fullName: string };
  } | null;
  unreadCount: number;
  updatedAt: string;
}

interface ChatableUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
}

// ─── Helpers ──────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

function getAvatarColor(id: string): string {
  const colors = [
    'from-blue-500 to-purple-500',
    'from-pink-500 to-rose-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-amber-500',
    'from-indigo-500 to-blue-500',
    'from-teal-500 to-cyan-500',
    'from-violet-500 to-purple-500',
    'from-red-500 to-pink-500',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ─── Component ────────────────────────────────────────

export default function MessagesPage() {
  const { user, accessToken } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [chatableUsers, setChatableUsers] = useState<ChatableUser[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const selectedConvRef = useRef<ConversationItem | null>(null);

  // Keep ref in sync with state for socket callbacks
  useEffect(() => {
    selectedConvRef.current = selectedConversation;
  }, [selectedConversation]);

  // ─── Auth headers helper (uses context token) ──────
  const getAuthHeaders = useCallback((): Record<string, string> => {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }, [accessToken]);

  // ─── Socket connection ──────────────────────────────
  const token = accessToken;

  const handleIncomingMessage = useCallback(
    (message: ChatMessage) => {
      // Update messages if viewing this conversation
      if (selectedConvRef.current?.id === message.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        // Mark as read if not sent by me
        if (message.senderId !== user?.id) {
          markAsRead(message.conversationId);
        }
      }

      // Update conversation list
      setConversations((prev) => {
        const updated = prev.map((conv) => {
          if (conv.id === message.conversationId) {
            return {
              ...conv,
              lastMessage: {
                id: message.id,
                content: message.content,
                createdAt: message.createdAt,
                sender: {
                  id: message.sender.id,
                  fullName: message.sender.fullName,
                },
              },
              unreadCount:
                message.senderId !== user?.id &&
                selectedConvRef.current?.id !== message.conversationId
                  ? conv.unreadCount + 1
                  : conv.unreadCount,
              updatedAt: message.createdAt,
            };
          }
          return conv;
        });

        // If conversation doesn't exist yet, reload the list
        if (!updated.some((c) => c.id === message.conversationId)) {
          fetchConversations();
        }

        return updated.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.id]
  );

  const handleTypingStart = useCallback((data: { conversationId: string; userId: string; fullName: string }) => {
    if (selectedConvRef.current?.id === data.conversationId) {
      setTypingUsers((prev) => new Map(prev).set(data.userId, data.fullName));
    }
  }, []);

  const handleTypingStop = useCallback((data: { conversationId: string; userId: string }) => {
    if (selectedConvRef.current?.id === data.conversationId) {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(data.userId);
        return next;
      });
    }
  }, []);

  const handleMessageRead = useCallback((data: { conversationId: string }) => {
    if (selectedConvRef.current?.id === data.conversationId) {
      setMessages((prev) =>
        prev.map((m) => (m.senderId === user?.id ? { ...m, status: 'READ' as const } : m))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const {
    isConnected,
    onlineUsers,
    sendMessage: socketSendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  } = useSocket({
    token,
    onMessage: handleIncomingMessage,
    onTypingStart: handleTypingStart,
    onTypingStop: handleTypingStop,
    onMessageRead: handleMessageRead,
  });

  // ─── Fetch conversations ────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch('/api/v1/chat/conversations', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [accessToken, getAuthHeaders]);

  // ─── Fetch chatable users ──────────────────────────
  const fetchChatableUsers = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await fetch('/api/v1/chat/users', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setChatableUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, [accessToken, getAuthHeaders]);

  useEffect(() => {
    if (!accessToken) return; // Wait for auth to be ready
    fetchConversations();
    fetchChatableUsers();
  }, [accessToken, fetchConversations, fetchChatableUsers]);

  // ─── Select conversation ────────────────────────────
  const selectConversation = useCallback(
    async (conv: ConversationItem) => {
      setSelectedConversation(conv);
      setShowChat(true);
      setLoadingMessages(true);
      setMessages([]);
      setTypingUsers(new Map());

      // Reset unread in UI
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
      );

      try {
        const headers = getAuthHeaders();
        const res = await fetch(`/api/v1/chat/conversations/${conv.id}/messages`, {
          headers,
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
          // Mark messages as read
          markAsRead(conv.id);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    },
    [markAsRead, getAuthHeaders]
  );

  // ─── Start new conversation ─────────────────────────
  const startNewConversation = useCallback(
    async (targetUser: ChatableUser) => {
      setShowNewChat(false);

      // Check if conversation already exists
      const existing = conversations.find(
        (c) => c.participant.id === targetUser.id
      );
      if (existing) {
        selectConversation(existing);
        return;
      }

      try {
        const res = await fetch('/api/v1/chat/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ participantId: targetUser.id }),
        });

        if (res.ok) {
          const data = await res.json();
          const newConv: ConversationItem = {
            id: data.conversation.id,
            participant: targetUser,
            lastMessage: null,
            unreadCount: 0,
            updatedAt: new Date().toISOString(),
          };
          setConversations((prev) => [newConv, ...prev]);
          selectConversation(newConv);
        }
      } catch (err) {
        console.error('Failed to create conversation:', err);
      }
    },
    [conversations, selectConversation, getAuthHeaders]
  );

  // ─── Send via REST (fallback) ──────────────────────
  const sendViaRest = useCallback(async (conversationId: string, content: string) => {
    try {
      const res = await fetch(`/api/v1/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    } catch (err) {
      console.error('REST fallback failed:', err);
    } finally {
      setSendingMessage(false);
    }
  }, [getAuthHeaders]);

  // ─── Send message ──────────────────────────────────
  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedConversation || sendingMessage) return;

    const content = messageInput.trim();
    setMessageInput('');
    setSendingMessage(true);

    // Stop typing indicator
    stopTyping(selectedConversation.id);

    if (isConnected) {
      socketSendMessage(selectedConversation.id, content, (response) => {
        setSendingMessage(false);
        if (response.error) {
          console.error('Socket send failed:', response.error);
          // Fallback to REST
          sendViaRest(selectedConversation.id, content);
        }
      });
    } else {
      sendViaRest(selectedConversation.id, content);
    }
  }, [messageInput, selectedConversation, sendingMessage, isConnected, socketSendMessage, stopTyping, sendViaRest]);

  // ─── Typing indicator ──────────────────────────────
  const handleInputChange = (value: string) => {
    setMessageInput(value);

    if (selectedConversation && value.trim()) {
      startTyping(selectedConversation.id);

      // Clear previous timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (selectedConversation) {
          stopTyping(selectedConversation.id);
        }
      }, 2000);
    } else if (selectedConversation) {
      stopTyping(selectedConversation.id);
    }
  };

  // ─── Auto-scroll to bottom ─────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // ─── Filter conversations ──────────────────────────
  const filteredConversations = conversations.filter((conv) =>
    conv.participant.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter chatable users (exclude those who already have conversations)
  const newChatUsers = chatableUsers.filter(
    (u) => !conversations.some((c) => c.participant.id === u.id)
  );

  // ─── Typing indicator text ─────────────────────────
  const typingText = typingUsers.size > 0
    ? `${Array.from(typingUsers.values()).join(', ')} is typing...`
    : null;

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* ───────────────────── Conversations Sidebar ──────────────── */}
      <div
        className={`w-full md:w-80 lg:w-96 shrink-0 bg-white border-r border-gray-200 flex flex-col ${
          showChat ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Messages</h1>
            <div className="flex items-center gap-2">
              {/* Connection indicator */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  isConnected
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {isConnected ? (
                  <Wifi className="w-3 h-3" />
                ) : (
                  <WifiOff className="w-3 h-3" />
                )}
                {isConnected ? 'Live' : 'Offline'}
              </div>

              {/* New chat button */}
              <button
                onClick={() => {
                  setShowNewChat(!showNewChat);
                  fetchChatableUsers();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="New conversation"
              >
                <MessageSquarePlus className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-red-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* New chat user list */}
        {showNewChat && (
          <div className="px-4 pb-3 border-b border-gray-200">
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">
              {user?.role === 'ADMIN' ? 'Users' : 'Admin'}
            </p>
            {newChatUsers.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">
                {conversations.length > 0
                  ? 'All available users have conversations'
                  : 'No users available'}
              </p>
            ) : (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {newChatUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => startNewConversation(u)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 bg-linear-to-br ${getAvatarColor(
                        u.id
                      )} rounded-full flex items-center justify-center text-white font-semibold text-xs`}
                    >
                      {getInitials(u.fullName)}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">{u.fullName}</div>
                      <div className="text-xs text-gray-500">@{u.username}</div>
                    </div>
                    {onlineUsers.has(u.id) && (
                      <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageSquarePlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {searchQuery
                  ? 'No matching conversations'
                  : 'No conversations yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => {
                    setShowNewChat(true);
                    fetchChatableUsers();
                  }}
                  className="mt-3 text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Start a conversation
                </button>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`px-4 md:px-6 py-4 cursor-pointer transition-all relative ${
                  selectedConversation?.id === conv.id
                    ? 'bg-red-50 border-r-4 border-r-red-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex gap-3">
                  <div className="relative shrink-0">
                    <div
                      className={`w-12 h-12 bg-linear-to-br ${getAvatarColor(
                        conv.participant.id
                      )} rounded-full flex items-center justify-center text-white font-semibold text-sm`}
                    >
                      {getInitials(conv.participant.fullName)}
                    </div>
                    {onlineUsers.has(conv.participant.id) && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {conv.participant.fullName}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {conv.participant.role === 'ADMIN' ? 'Admin' : 'User'}
                        </span>
                      </div>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conv.lastMessage
                        ? conv.lastMessage.sender.id === user?.id
                          ? `You: ${conv.lastMessage.content}`
                          : conv.lastMessage.content
                        : 'No messages yet'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="absolute top-4 right-4">
                      <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full">
                        {conv.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ───────────────────── Chat Area ─────────────────────────── */}
      <div
        className={`flex-1 flex flex-col bg-gray-50 min-w-0 ${
          showChat ? 'flex' : 'hidden md:flex'
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-100 px-4 md:px-8 py-3 md:py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowChat(false)}
                    className="md:hidden p-1.5 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="relative">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 bg-linear-to-br ${getAvatarColor(
                        selectedConversation.participant.id
                      )} rounded-full flex items-center justify-center text-white font-semibold text-sm`}
                    >
                      {getInitials(selectedConversation.participant.fullName)}
                    </div>
                    {onlineUsers.has(selectedConversation.participant.id) && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 text-base md:text-lg leading-tight">
                      {selectedConversation.participant.fullName}
                    </h2>
                    <p className="text-xs md:text-sm font-medium">
                      {typingText ? (
                        <span className="text-red-500 animate-pulse">{typingText}</span>
                      ) : onlineUsers.has(selectedConversation.participant.id) ? (
                        <span className="text-green-600">Active Now</span>
                      ) : (
                        <span className="text-gray-400">Offline</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      selectedConversation.participant.role === 'ADMIN'
                        ? 'bg-purple-50 text-purple-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {selectedConversation.participant.role === 'ADMIN' ? 'Admin' : 'User'}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
              {loadingMessages ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-center">
                  <div>
                    <div
                      className={`w-16 h-16 mx-auto mb-3 bg-linear-to-br ${getAvatarColor(
                        selectedConversation.participant.id
                      )} rounded-full flex items-center justify-center text-white font-bold text-xl`}
                    >
                      {getInitials(selectedConversation.participant.fullName)}
                    </div>
                    <p className="text-gray-500 text-sm">
                      Start your conversation with{' '}
                      <span className="font-semibold">
                        {selectedConversation.participant.fullName}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => {
                  const isMe = message.senderId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex gap-2 md:gap-3 max-w-[85%] md:max-w-2xl ${
                          isMe ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {!isMe && (
                          <div
                            className={`w-8 h-8 md:w-10 md:h-10 shrink-0 bg-linear-to-br ${getAvatarColor(
                              message.sender.id
                            )} rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm`}
                          >
                            {getInitials(message.sender.fullName)}
                          </div>
                        )}
                        <div
                          className={`flex flex-col ${
                            isMe ? 'items-end' : 'items-start'
                          }`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-2.5 md:px-5 md:py-3 ${
                              isMe
                                ? 'bg-red-500 text-white rounded-tr-sm'
                                : 'bg-white text-gray-900 border border-gray-100 rounded-tl-sm shadow-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 mt-1 ${
                              isMe ? 'flex-row-reverse' : 'flex-row'
                            }`}
                          >
                            <span className="text-xs text-gray-400">
                              {formatTime(message.createdAt)}
                            </span>
                            {isMe &&
                              (message.status === 'READ' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                              ) : message.status === 'DELIVERED' ? (
                                <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-gray-400" />
                              ))}
                          </div>
                        </div>
                        {isMe && (
                          <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 bg-linear-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm">
                            {user ? getInitials(user.fullName) : 'ME'}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {typingText && (
                <div className="flex justify-start">
                  <div className="flex gap-2 items-end">
                    <div
                      className={`w-8 h-8 shrink-0 bg-linear-to-br ${getAvatarColor(
                        selectedConversation.participant.id
                      )} rounded-full flex items-center justify-center text-white font-semibold text-xs`}
                    >
                      {getInitials(selectedConversation.participant.fullName)}
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-100 px-3 md:px-8 py-3 md:py-4">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={messageInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl resize-none focus:ring-2 focus:ring-red-400 focus:bg-white transition-all text-sm"
                    rows={1}
                  />
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendingMessage}
                  className="p-2.5 md:px-5 md:py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center gap-1.5"
                >
                  {sendingMessage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className="hidden md:inline">Send</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquarePlus className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Select a conversation
              </h3>
              <p className="text-sm text-gray-500">
                {user?.role === 'ADMIN'
                  ? 'Choose a user to start chatting'
                  : 'Chat with admin for support'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
