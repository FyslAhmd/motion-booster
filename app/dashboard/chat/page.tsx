'use client';

import AdminShell from '../_components/AdminShell';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useSocket, type ChatMessage, type MessageType } from '@/lib/chat/use-socket';
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
  Paperclip,
  Mic,
  X,
  FileText,
  Download,
  Image as ImageIcon,
  Film,
  Square,
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
    messageType?: MessageType;
    fileName?: string | null;
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

interface PendingFile {
  file: File;
  preview?: string; // data URL for image previews
  messageType: MessageType;
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function detectMessageType(mimeType: string): MessageType {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'VOICE';
  return 'FILE';
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getLastMessagePreview(msg: ConversationItem['lastMessage'], myId?: string): string {
  if (!msg) return 'No messages yet';
  const prefix = msg.sender.id === myId ? 'You: ' : '';
  switch (msg.messageType) {
    case 'IMAGE': return `${prefix}📷 Photo`;
    case 'VIDEO': return `${prefix}🎬 Video`;
    case 'FILE':  return `${prefix}📎 ${msg.fileName || 'File'}`;
    case 'VOICE': return `${prefix}🎤 Voice message`;
    default:      return `${prefix}${msg.content}`;
  }
}

function getFileIcon(mimeType?: string | null) {
  if (!mimeType) return <FileText className="w-5 h-5" />;
  if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
  if (mimeType.startsWith('video/')) return <Film className="w-5 h-5" />;
  return <FileText className="w-5 h-5" />;
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

  // ─── File attachment state ─────────────────────────
  const [pendingFile, setPendingFile] = useState<PendingFile | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Voice recording state ────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

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
                messageType: message.messageType,
                fileName: message.fileName,
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
  const sendViaRest = useCallback(async (
    conversationId: string,
    content: string,
    metadata?: {
      messageType?: MessageType;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      duration?: number;
    }
  ) => {
    try {
      const res = await fetch(`/api/v1/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ content, ...metadata }),
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

  // ─── Upload file to server ─────────────────────────
  const uploadFile = useCallback(async (file: File): Promise<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  } | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/v1/chat/upload', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Upload failed');
        return null;
      }

      return await res.json();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload file. Please try again.');
      return null;
    }
  }, [getAuthHeaders]);

  // ─── Handle file selection ─────────────────────────
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again
    e.target.value = '';

    const msgType = detectMessageType(file.type);
    const isVoice = file.type.startsWith('audio/');

    // Size validation (voice exempt)
    if (!isVoice && file.size > MAX_FILE_SIZE) {
      alert(`File must be under 10 MB. Your file is ${formatFileSize(file.size)}.`);
      return;
    }

    // Create preview for images
    let preview: string | undefined;
    if (msgType === 'IMAGE') {
      preview = URL.createObjectURL(file);
    }

    setPendingFile({ file, preview, messageType: msgType });
  }, []);

  // ─── Cancel pending file ──────────────────────────
  const cancelPendingFile = useCallback(() => {
    if (pendingFile?.preview) {
      URL.revokeObjectURL(pendingFile.preview);
    }
    setPendingFile(null);
  }, [pendingFile]);

  // ─── Send file message ────────────────────────────
  const sendFileMessage = useCallback(async () => {
    if (!pendingFile || !selectedConversation) return;

    setUploadingFile(true);
    setSendingMessage(true);

    const uploadResult = await uploadFile(pendingFile.file);
    if (!uploadResult) {
      setUploadingFile(false);
      setSendingMessage(false);
      return;
    }

    const caption = messageInput.trim();
    const metadata = {
      messageType: pendingFile.messageType,
      fileUrl: uploadResult.fileUrl,
      fileName: uploadResult.fileName,
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType,
    };

    // Clean up
    cancelPendingFile();
    setMessageInput('');
    setUploadingFile(false);

    if (isConnected) {
      socketSendMessage(selectedConversation.id, caption, metadata, (response) => {
        setSendingMessage(false);
        if (response.error) {
          sendViaRest(selectedConversation.id, caption, metadata);
        }
      });
    } else {
      sendViaRest(selectedConversation.id, caption, metadata);
    }
  }, [pendingFile, selectedConversation, messageInput, isConnected, uploadFile, cancelPendingFile, socketSendMessage, sendViaRest]);

  // ─── Voice recording ─────────────────────────────
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Try opus codec first, fall back to default
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.start(100); // Collect in 100ms chunks
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setRecordingDuration(0);
  }, []);

  const sendVoiceMessage = useCallback(async () => {
    if (!mediaRecorderRef.current || !selectedConversation) return;

    const duration = recordingDuration;
    const recorder = mediaRecorderRef.current;

    // Stop recording
    return new Promise<void>((resolve) => {
      recorder.onstop = async () => {
        // Stop mic stream
        recorder.stream.getTracks().forEach((t) => t.stop());
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        setIsRecording(false);
        setRecordingDuration(0);

        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: recorder.mimeType });

        setSendingMessage(true);
        const uploadResult = await uploadFile(file);
        if (!uploadResult) {
          setSendingMessage(false);
          resolve();
          return;
        }

        const metadata = {
          messageType: 'VOICE' as MessageType,
          fileUrl: uploadResult.fileUrl,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType,
          duration,
        };

        if (isConnected) {
          socketSendMessage(selectedConversation.id, '', metadata, (response) => {
            setSendingMessage(false);
            if (response.error) {
              sendViaRest(selectedConversation.id, '', metadata);
            }
          });
        } else {
          sendViaRest(selectedConversation.id, '', metadata);
        }
        resolve();
      };

      recorder.stop();
    });
  }, [selectedConversation, recordingDuration, isConnected, uploadFile, socketSendMessage, sendViaRest]);

  // ─── Send message ──────────────────────────────────
  const handleSendMessage = useCallback(() => {
    // If there's a pending file, send that instead
    if (pendingFile) {
      sendFileMessage();
      return;
    }

    if (!messageInput.trim() || !selectedConversation || sendingMessage) return;

    const content = messageInput.trim();
    setMessageInput('');
    setSendingMessage(true);

    // Stop typing indicator
    stopTyping(selectedConversation.id);

    if (isConnected) {
      socketSendMessage(selectedConversation.id, content, undefined, (response) => {
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
  }, [pendingFile, sendFileMessage, messageInput, selectedConversation, sendingMessage, isConnected, socketSendMessage, stopTyping, sendViaRest]);

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
    <AdminShell noPadding>
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
                      {getLastMessagePreview(conv.lastMessage, user?.id)}
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
                            className={`rounded-2xl overflow-hidden ${
                              isMe
                                ? 'bg-red-500 text-white rounded-tr-sm'
                                : 'bg-white text-gray-900 border border-gray-100 rounded-tl-sm shadow-sm'
                            } ${message.messageType === 'IMAGE' || message.messageType === 'VIDEO' ? 'p-1' : 'px-4 py-2.5 md:px-5 md:py-3'}`}
                          >
                            {/* ── IMAGE ── */}
                            {message.messageType === 'IMAGE' && message.fileUrl && (
                              <div>
                                <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={message.fileUrl}
                                    alt={message.fileName || 'Image'}
                                    className="max-w-70 max-h-75 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    loading="lazy"
                                  />
                                </a>
                                {message.content && (
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap px-3 py-2">
                                    {message.content}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* ── VIDEO ── */}
                            {message.messageType === 'VIDEO' && message.fileUrl && (
                              <div>
                                <video
                                  src={message.fileUrl}
                                  controls
                                  preload="metadata"
                                  className="max-w-75 max-h-70 rounded-xl"
                                />
                                {message.content && (
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap px-3 py-2">
                                    {message.content}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* ── FILE (document) ── */}
                            {message.messageType === 'FILE' && message.fileUrl && (
                              <div>
                                <a
                                  href={message.fileUrl}
                                  download={message.fileName || true}
                                  className={`flex items-center gap-3 ${
                                    isMe ? 'hover:bg-red-600' : 'hover:bg-gray-50'
                                  } rounded-lg transition-colors p-1`}
                                >
                                  <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${
                                    isMe ? 'bg-red-400/30' : 'bg-gray-100'
                                  }`}>
                                    {getFileIcon(message.mimeType)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate max-w-45">
                                      {message.fileName || 'File'}
                                    </p>
                                    <p className={`text-xs ${isMe ? 'text-red-200' : 'text-gray-400'}`}>
                                      {message.fileSize ? formatFileSize(message.fileSize) : 'Download'}
                                    </p>
                                  </div>
                                  <Download className={`w-4 h-4 shrink-0 ${isMe ? 'text-red-200' : 'text-gray-400'}`} />
                                </a>
                                {message.content && (
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap mt-1">
                                    {message.content}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* ── VOICE ── */}
                            {message.messageType === 'VOICE' && message.fileUrl && (
                              <div className="flex items-center gap-3 min-w-50">
                                <audio
                                  src={message.fileUrl}
                                  controls
                                  preload="metadata"
                                  className="h-8 max-w-55"
                                  style={{ filter: isMe ? 'invert(1) brightness(2)' : 'none' }}
                                />
                                {message.duration != null && (
                                  <span className={`text-xs shrink-0 ${isMe ? 'text-red-200' : 'text-gray-400'}`}>
                                    {formatDuration(message.duration)}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* ── TEXT (default) ── */}
                            {(!message.messageType || message.messageType === 'TEXT') && (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                {message.content}
                              </p>
                            )}
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
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                onChange={handleFileSelect}
              />

              {/* Pending file preview */}
              {pendingFile && (
                <div className="mb-3 flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  {pendingFile.messageType === 'IMAGE' && pendingFile.preview ? (
                    <img
                      src={pendingFile.preview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      {getFileIcon(pendingFile.file.type)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {pendingFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(pendingFile.file.size)}
                    </p>
                  </div>
                  <button
                    onClick={cancelPendingFile}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}

              {/* Voice recording UI */}
              {isRecording ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={cancelRecording}
                    className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                    title="Cancel recording"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="flex-1 flex items-center gap-3 bg-red-50 rounded-xl px-4 py-2.5">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-red-700">
                      Recording {formatDuration(recordingDuration)}
                    </span>
                  </div>
                  <button
                    onClick={sendVoiceMessage}
                    className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all flex items-center gap-1.5"
                    title="Send voice message"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden md:inline text-sm font-medium">Send</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Attachment button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5 text-gray-500" />
                  </button>

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
                      placeholder={pendingFile ? 'Add a caption...' : 'Type your message...'}
                      className="w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl resize-none focus:ring-2 focus:ring-red-400 focus:bg-white transition-all text-sm"
                      rows={1}
                    />
                  </div>

                  {/* Show Send button when there's text or a pending file, otherwise show Mic */}
                  {messageInput.trim() || pendingFile ? (
                    <button
                      onClick={handleSendMessage}
                      disabled={(!messageInput.trim() && !pendingFile) || sendingMessage || uploadingFile}
                      className="p-2.5 md:px-5 md:py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-sm flex items-center gap-1.5"
                    >
                      {sendingMessage || uploadingFile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span className="hidden md:inline">Send</span>
                    </button>
                  ) : (
                    <button
                      onClick={startRecording}
                      className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                      title="Record voice message"
                    >
                      <Mic className="w-5 h-5 text-gray-500" />
                    </button>
                  )}
                </div>
              )}
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
    </AdminShell>
  );
}