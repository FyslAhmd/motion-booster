'use client';

import AdminShell from '../_components/AdminShell';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useSocket, type ChatMessage, type MessageType } from '@/lib/chat/use-socket';
import { COUNTRY_CODES } from '@/lib/data/country-codes';
import LiveChatGuidedFlow, { type LiveChatGuideOptionId } from './_components/LiveChatGuidedFlow';
import { toast } from 'sonner';
import { AdminSectionSkeleton } from '@/components/ui/AdminSectionSkeleton';
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
  Rocket,
  BadgeCheck,
  ChevronDown,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────

interface Participant {
  id: string;
  username: string;
  fullName: string;
  role: string;
  avatarUrl?: string | null;
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
  avatarUrl?: string | null;
}

interface PendingFile {
  file: File;
  preview?: string; // data URL for image previews
  messageType: MessageType;
}

type BoostPlacement = 'facebook' | 'instagram' | 'whatsapp';
type BoostLocation = string;
type BoostGender = 'male' | 'female' | 'both';
type BoostAudienceLanguage = 'en' | 'bn' | 'hindi';

interface BoostFormData {
  postLink: string;
  totalBudget: string;
  dailyBudget: string;
  placements: BoostPlacement[];
  location: BoostLocation;
  minAge: string;
  maxAge: string;
  gender: BoostGender;
  audienceLanguages: BoostAudienceLanguage[];
  notes: string;
}

interface ServiceDeskOption {
  id: LiveChatGuideOptionId;
  labelEn: string;
  labelBn: string;
  quickMessageEn: string;
  quickMessageBn: string;
  badgeGradient: string;
}

const DEFAULT_BOOST_DATA: BoostFormData = {
  postLink: '',
  totalBudget: '',
  dailyBudget: '',
  placements: [],
  location: 'Bangladesh',
  minAge: '18',
  maxAge: '65',
  gender: 'male',
  audienceLanguages: [],
  notes: '',
};

const createDefaultBoostData = (): BoostFormData => ({
  ...DEFAULT_BOOST_DATA,
  placements: [...DEFAULT_BOOST_DATA.placements],
  audienceLanguages: [...DEFAULT_BOOST_DATA.audienceLanguages],
});

const SERVICE_DESK_OPTIONS: ServiceDeskOption[] = [
  {
    id: 'boost-request',
    labelEn: 'Boost Request',
    labelBn: 'বুস্ট রিকোয়েস্ট',
    quickMessageEn: 'Hello admin, I want to submit a boost request. Please guide me.',
    quickMessageBn: 'হ্যালো অ্যাডমিন, আমি একটি বুস্ট রিকোয়েস্ট সাবমিট করতে চাই। আমাকে গাইড করুন।',
    badgeGradient: 'linear-gradient(135deg, #ff7a18 0%, #ff2525 100%)',
  },
  {
    id: 'support',
    labelEn: 'Support',
    labelBn: 'সাপোর্ট',
    quickMessageEn: 'Hello admin, I need support with my current service. Please assist me.',
    quickMessageBn: 'হ্যালো অ্যাডমিন, আমার বর্তমান সার্ভিস নিয়ে সাপোর্ট দরকার। দয়া করে সহায়তা করুন।',
    badgeGradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
  },
  {
    id: 'others',
    labelEn: 'Others',
    labelBn: 'অন্যান্য',
    quickMessageEn: 'Hello admin, I have another inquiry. Please assist me.',
    quickMessageBn: 'হ্যালো অ্যাডমিন, আমার অন্য একটি বিষয়ে জানতে চাই। দয়া করে সহায়তা করুন।',
    badgeGradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
  },
];

const LEGACY_AUTO_KICKOFF_MESSAGES = new Set([
  [
    'Service request: Boost & Ads',
    'Details: Facebook and Instagram campaign setup, targeting, and optimization.',
    '',
    'Hello admin, I need help with Boost & Ads service. Please guide me with packages and targeting steps.',
  ].join('\n').trim(),
  [
    'Service request: Boost & Ads',
    'Details: Facebook and Instagram campaign setup, targeting, and optimization.',
  ].join('\n').trim(),
]);

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

function formatClockLabel(date: Date = new Date()): string {
  return date
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .toLowerCase();
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

function getFileIcon(mimeType?: string | null) {
  if (!mimeType) return <FileText className="w-5 h-5" />;
  if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
  if (mimeType.startsWith('video/')) return <Film className="w-5 h-5" />;
  return <FileText className="w-5 h-5" />;
}

function AdminBlueTick({ role }: { role?: string | null }) {
  if ((role || '').toUpperCase() !== 'ADMIN') return null;

  return (
    <BadgeCheck
      className="h-4 w-4 [&>path:first-child]:fill-blue-500 [&>path:first-child]:stroke-blue-500 [&>path:last-child]:stroke-white [&>path:last-child]:stroke-[2.6]"
      aria-label="Verified admin"
    />
  );
}

// ─── Component ────────────────────────────────────────

export default function MessagesPage() {
  const { user, accessToken, refreshSession } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [selectedServiceOption, setSelectedServiceOption] = useState<ServiceDeskOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showLiveChatGuide, setShowLiveChatGuide] = useState(false);
  const [serviceDeskBootstrapped, setServiceDeskBootstrapped] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const [chatableUsers, setChatableUsers] = useState<ChatableUser[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [liveChatLanguage, setLiveChatLanguage] = useState<'en' | 'bn' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Boost form state ──────────────────────────────
  const [showBoostForm, setShowBoostForm] = useState(false);
  const [boostStep, setBoostStep] = useState(0); // 0=lang, 1=form
  const [boostLang, setBoostLang] = useState<'en' | 'bn'>('en');
  const [boostData, setBoostData] = useState<BoostFormData>(createDefaultBoostData);
  const [boostSubmitting, setBoostSubmitting] = useState(false);
  const [boostSuccess, setBoostSuccess] = useState(false);
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

  // Open service desk by default for clients on first load (especially important on mobile).
  useEffect(() => {
    if (serviceDeskBootstrapped) return;
    if (!user?.role) return;

    if (user.role !== 'ADMIN' && !selectedConversation) {
      setShowChat(true);
    }

    setServiceDeskBootstrapped(true);
  }, [serviceDeskBootstrapped, user?.role, selectedConversation]);

  useEffect(() => {
    setLiveChatLanguage(null);
    setSelectedServiceOption(null);
  }, [selectedConversation?.id]);

  const liveChatOnboardingTime = formatClockLabel();

  // ─── Auth headers helper (uses context token) ──────
  const getAuthHeaders = useCallback((): Record<string, string> => {
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }, [accessToken]);

  // ─── Fetch wrapper: auto-refresh on 401 & retry once ──
  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const res = await fetch(url, { ...options, headers: { ...options.headers, ...getAuthHeaders() } });
    if (res.status === 401) {
      const newToken = await refreshSession();
      if (newToken) {
        return fetch(url, {
          ...options,
          headers: { ...options.headers, Authorization: `Bearer ${newToken}` },
        });
      }
    }
    return res;
  }, [getAuthHeaders, refreshSession]);

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
      const res = await authFetch('/api/v1/chat/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, [accessToken, authFetch]);

  // ─── Fetch chatable users ──────────────────────────
  const fetchChatableUsers = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await authFetch('/api/v1/chat/users');
      if (res.ok) {
        const data = await res.json();
        setChatableUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, [accessToken, authFetch]);

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
        const res = await authFetch(`/api/v1/chat/conversations/${conv.id}/messages`);
        if (res.ok) {
          const data = await res.json();
          const fetchedMessages: ChatMessage[] = data.messages;
          setMessages(fetchedMessages);

          // Mark messages as read
          markAsRead(conv.id);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    },
    [markAsRead, authFetch]
  );

  // ─── Start new conversation ─────────────────────────
  const startNewConversation = useCallback(
    async (targetUser: ChatableUser): Promise<ConversationItem | null> => {
      setShowNewChat(false);

      // Check if conversation already exists
      const existing = conversations.find(
        (c) => c.participant.id === targetUser.id
      );
      if (existing) {
        await selectConversation(existing);
        return existing;
      }

      try {
        const res = await authFetch('/api/v1/chat/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
          await selectConversation(newConv);
          return newConv;
        }
      } catch (err) {
        console.error('Failed to create conversation:', err);
      }

      return null;
    },
    [conversations, selectConversation, authFetch]
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
      const res = await authFetch(`/api/v1/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
  }, [authFetch]);

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
      const res = await authFetch('/api/v1/chat/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Upload failed');
        return null;
      }

      return await res.json();
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Failed to upload file. Please try again.');
      return null;
    }
  }, [authFetch]);

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
      toast.error(`File must be under 10 MB. Your file is ${formatFileSize(file.size)}.`);
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
      toast.error('Could not access microphone. Please check permissions.');
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

  const isRoleAdmin = (role?: string | null) => (role || '').toUpperCase() === 'ADMIN';
  const isUserShownOnline = (id: string, role?: string | null) => onlineUsers.has(id) || isRoleAdmin(role);

  const conversationByParticipantId = useMemo(
    () => new Map(conversations.map((conv) => [conv.participant.id, conv])),
    [conversations],
  );

  const directoryUsers = useMemo(() => {
    const byId = new Map<string, ChatableUser>();

    for (const conv of conversations) {
      byId.set(conv.participant.id, {
        id: conv.participant.id,
        username: conv.participant.username,
        fullName: conv.participant.fullName,
        role: conv.participant.role,
        avatarUrl: conv.participant.avatarUrl ?? null,
      });
    }

    for (const userItem of chatableUsers) {
      if (!byId.has(userItem.id)) {
        byId.set(userItem.id, userItem);
      }
    }

    return Array.from(byId.values()).sort((a, b) => {
      const convA = conversationByParticipantId.get(a.id);
      const convB = conversationByParticipantId.get(b.id);
      const tA = convA ? new Date(convA.updatedAt).getTime() : 0;
      const tB = convB ? new Date(convB.updatedAt).getTime() : 0;
      if (tA !== tB) return tB - tA;
      return a.fullName.localeCompare(b.fullName);
    });
  }, [chatableUsers, conversations, conversationByParticipantId]);

  const openUserConversation = useCallback(
    (person: ChatableUser) => {
      const existing = conversationByParticipantId.get(person.id);
      if (existing) {
        void selectConversation(existing);
        return;
      }
      void startNewConversation(person);
    },
    [conversationByParticipantId, selectConversation, startNewConversation],
  );

  // ─── Filter user directory ─────────────────────────
  const filteredDirectoryUsers = directoryUsers.filter((person) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      person.fullName.toLowerCase().includes(q) ||
      person.username.toLowerCase().includes(q)
    );
  });

  // Filter chatable users (exclude those who already have conversations)
  const newChatUsers = chatableUsers.filter(
    (u) => !conversations.some((c) => c.participant.id === u.id)
  );

  const clientLiveChatPerson = useMemo(() => {
    const latestAdminConversation = conversations
      .filter((conversation) => isRoleAdmin(conversation.participant.role))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];

    if (latestAdminConversation) {
      return {
        id: latestAdminConversation.participant.id,
        username: latestAdminConversation.participant.username,
        fullName: latestAdminConversation.participant.fullName,
        role: latestAdminConversation.participant.role,
        avatarUrl: latestAdminConversation.participant.avatarUrl ?? null,
      } satisfies ChatableUser;
    }

    return filteredDirectoryUsers.find((person) => isRoleAdmin(person.role)) || null;
  }, [conversations, filteredDirectoryUsers]);

  const isClientLiveChatConversation = Boolean(
    selectedConversation &&
    user?.role !== 'ADMIN' &&
    (selectedConversation.participant.role || '').toUpperCase() === 'ADMIN',
  );

  const startLiveChatWithGuide = useCallback(() => {
    if (!clientLiveChatPerson) return;

    setShowChat(true);
    setShowLiveChatGuide(true);
    setLiveChatLanguage(null);
    setSelectedServiceOption(null);
    openUserConversation(clientLiveChatPerson);
  }, [clientLiveChatPerson, openUserConversation]);

  const reopenLiveChatGuide = useCallback(() => {
    if (!isClientLiveChatConversation || user?.role === 'ADMIN') return;

    setShowLiveChatGuide(true);
    setLiveChatLanguage(null);
    setSelectedServiceOption(null);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [isClientLiveChatConversation, user?.role]);

  const visibleMessages = useMemo(
    () => messages.filter((message) => {
      if (!isClientLiveChatConversation) return true;
      return !LEGACY_AUTO_KICKOFF_MESSAGES.has((message.content || '').trim());
    }),
    [messages, isClientLiveChatConversation],
  );

  // ─── Typing indicator text ─────────────────────────
  const typingText = typingUsers.size > 0
    ? `${Array.from(typingUsers.values()).join(', ')} is typing...`
    : null;

  // ─── Boost form helpers ────────────────────────────
  const boostLabels = boostLang === 'bn'
    ? {
        title: 'পোস্ট বুস্ট করুন',
        langTitle: 'ভাষা নির্বাচন করুন',
        postLink: 'ফেসবুক পোস্ট লিংক',
        postLinkPlaceholder: 'https://www.facebook.com/... পোস্টের লিংক দিন',
        totalBudget: 'মোট বাজেট',
        totalBudgetPlaceholder: 'যেমন: ৫০০০ টাকা',
        dailyBudget: 'দৈনিক বাজেট',
        dailyBudgetPlaceholder: 'যেমন: ৫০০ টাকা',
        targetAudience: 'টার্গেট অডিয়েন্স',
        targetAudiencePlaceholder: 'কাদের কাছে পৌঁছাতে চান তা লিখুন...',
        submit: 'জমা দিন',
        cancel: 'বাতিল',
        next: 'পরবর্তী',
        back: 'পেছনে',
        success: 'আপনার বুস্ট রিকুয়েস্ট সফলভাবে জমা হয়েছে!',
        close: 'বন্ধ করুন',
      }
    : {
        title: 'Boost Your Post',
        langTitle: 'Select Language',
        postLink: 'Facebook Post Link',
        postLinkPlaceholder: 'https://www.facebook.com/... paste post link',
        totalBudget: 'Total Budget',
        totalBudgetPlaceholder: 'e.g. 5000 BDT',
        dailyBudget: 'Daily Budget',
        dailyBudgetPlaceholder: 'e.g. 500 BDT',
        targetAudience: 'Target Audience',
        targetAudiencePlaceholder: 'Describe who you want to reach...',
        submit: 'Submit',
        cancel: 'Cancel',
        next: 'Next',
        back: 'Back',
        success: 'Your boost request has been submitted successfully!',
        close: 'Close',
      };

  const placementOptions: Array<{ value: BoostPlacement; label: string }> = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ];

  const locationOptions: Array<{ value: BoostLocation; label: string }> = [
    { value: 'All Country', label: 'All Country' },
    ...COUNTRY_CODES.map((country) => ({
      value: country.name,
      label: `${country.name} (${country.code})`,
    })),
  ];

  const genderOptions: Array<{ value: BoostGender; label: string }> = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'both', label: 'Both' },
  ];

  const audienceLanguageOptions: Array<{ value: BoostAudienceLanguage; label: string }> = [
    { value: 'en', label: 'English' },
    { value: 'bn', label: 'Bangla' },
    { value: 'hindi', label: 'Hindi' },
  ];

  const boostFieldLabels = {
    placement: boostLang === 'bn' ? 'প্লেসমেন্ট' : 'Placement',
    location: boostLang === 'bn' ? 'লোকেশন' : 'Location',
    minAge: boostLang === 'bn' ? 'সর্বনিম্ন বয়স' : 'Minimum Age',
    maxAge: boostLang === 'bn' ? 'সর্বোচ্চ বয়স' : 'Maximum Age',
    gender: boostLang === 'bn' ? 'জেন্ডার' : 'Gender',
    audienceLanguage: boostLang === 'bn' ? 'অডিয়েন্স ভাষা' : 'Audience Language',
    notes: boostLang === 'bn' ? 'অতিরিক্ত নোট' : 'Additional Notes',
    notesPlaceholder: boostLang === 'bn'
      ? 'যদি কোনো অতিরিক্ত টার্গেট থাকে লিখুন...'
      : 'Any extra targeting instruction...',
  };

  const togglePlacement = (placement: BoostPlacement) => {
    setBoostData((prev) => ({
      ...prev,
      placements: prev.placements.includes(placement)
        ? prev.placements.filter((item) => item !== placement)
        : [...prev.placements, placement],
    }));
  };

  const toggleAudienceLanguage = (lang: BoostAudienceLanguage) => {
    setBoostData((prev) => ({
      ...prev,
      audienceLanguages: prev.audienceLanguages.includes(lang)
        ? prev.audienceLanguages.filter((item) => item !== lang)
        : [...prev.audienceLanguages, lang],
    }));
  };

  const normalizedMinAge = Math.max(18, Number.parseInt(boostData.minAge || '18', 10) || 18);
  const parsedMaxAge = Number.parseInt(boostData.maxAge || '', 10);
  const normalizedMaxAge = Number.isFinite(parsedMaxAge)
    ? Math.max(normalizedMinAge, parsedMaxAge)
    : '';
  const canSubmitBoost = Boolean(
    boostData.postLink.trim() &&
    boostData.totalBudget.trim() &&
    boostData.dailyBudget.trim() &&
    boostData.placements.length > 0 &&
    boostData.audienceLanguages.length > 0,
  );

  const handleLiveChatLanguageSelect = useCallback((lang: 'en' | 'bn') => {
    setLiveChatLanguage(lang);
    setBoostLang(lang);
  }, []);

  const notifyServiceDeskAdmins = useCallback(async (topicId: LiveChatGuideOptionId) => {
    if (user?.role === 'ADMIN') return;

    try {
      const res = await authFetch('/api/v1/chat/service-desk-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        console.error('Failed to notify service desk admins:', json?.error || res.statusText);
      }
    } catch (error) {
      console.error('Failed to notify service desk admins:', error);
    }
  }, [authFetch, user?.role]);

  const openBoostForm = useCallback((preferredLang: 'en' | 'bn' = 'en') => {
    setBoostStep(0);
    setBoostLang(preferredLang);
    setBoostData(createDefaultBoostData());
    setBoostSuccess(false);
    setShowBoostForm(true);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  const handleLiveChatTopicSelect = useCallback((topicId: LiveChatGuideOptionId) => {
    const preferredLang = liveChatLanguage ?? 'en';
    const serviceOption = SERVICE_DESK_OPTIONS.find((option) => option.id === topicId);

    if (!serviceOption) return;

    setSelectedServiceOption(serviceOption);
    setShowLiveChatGuide(false);
    void notifyServiceDeskAdmins(topicId);

    if (serviceOption.id === 'boost-request') {
      openBoostForm(preferredLang);
      return;
    }

    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [liveChatLanguage, notifyServiceDeskAdmins, openBoostForm]);

  const handleBoostSubmit = async () => {
    if (!canSubmitBoost) return;

    const selectedPlacementLabels = placementOptions
      .filter((option) => boostData.placements.includes(option.value))
      .map((option) => option.label);
    const selectedLanguageLabels = audienceLanguageOptions
      .filter((option) => boostData.audienceLanguages.includes(option.value))
      .map((option) => option.label);
    const selectedLocationLabel = locationOptions.find((option) => option.value === boostData.location)?.label || boostData.location || 'Bangladesh (BD)';
    const selectedGenderLabel = genderOptions.find((option) => option.value === boostData.gender)?.label || 'Both';

    const targetAudience = [
      boostData.postLink.trim() ? `Facebook Boost Link: ${boostData.postLink.trim()}` : '',
      `Placements: ${selectedPlacementLabels.join(', ')}`,
      `Location: ${selectedLocationLabel}`,
      `Age: ${normalizedMaxAge === '' ? `${normalizedMinAge}+` : `${normalizedMinAge}-${normalizedMaxAge}`}`,
      `Gender: ${selectedGenderLabel}`,
      `Language: ${selectedLanguageLabels.join(', ')}`,
      boostData.notes.trim() ? `Notes: ${boostData.notes.trim()}` : '',
    ].filter(Boolean).join('\n');

    setBoostSubmitting(true);
    try {
      const res = await authFetch('/api/v1/boost-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: boostLang,
          postLink: boostData.postLink.trim(),
          totalBudget: boostData.totalBudget,
          dailyBudget: boostData.dailyBudget,
          targetAudience,
          placements: boostData.placements,
          location: boostData.location,
          minAge: normalizedMinAge,
          maxAge: normalizedMaxAge === '' ? null : normalizedMaxAge,
          gender: boostData.gender,
          audienceLanguages: boostData.audienceLanguages,
          notes: boostData.notes.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      setBoostSuccess(true);
    } catch {
      alert(boostLang === 'bn' ? 'জমা দিতে সমস্যা হয়েছে।' : 'Failed to submit. Please try again.');
    } finally {
      setBoostSubmitting(false);
    }
  };

  return (
    <AdminShell noPadding>
    <div className="flex h-full w-full min-w-0 bg-gray-50 overflow-hidden">
      {/* ───────────────────── Conversations Sidebar ──────────────── */}
      <div
        className={`w-full sm:w-80 lg:w-96 shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col ${
          showChat ? 'hidden sm:flex' : 'flex'
        }`}
      >
        {/* Header */}
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {user?.role === 'ADMIN' ? 'Messages' : 'Live Chat'}
            </h1>
            <div className="flex items-center gap-2">
              {user?.role !== 'ADMIN' && (
                <button
                  onClick={() => setShowChat(true)}
                  className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Open service desk"
                >
                  <Rocket className="w-5 h-5 text-gray-600" />
                </button>
              )}

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
              {user?.role === 'ADMIN' && (
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
              )}
            </div>
          </div>

          {user?.role === 'ADMIN' && (
            <>
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

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      People ({directoryUsers.length})
                    </p>
                    <span className="text-[11px] text-green-600 font-medium">
                      Active: {directoryUsers.filter((person) => isUserShownOnline(person.id, person.role)).length}
                    </span>
                  </div>
                  <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
                    {directoryUsers.map((person) => {
                      const isOnline = isUserShownOnline(person.id, person.role);
                      const hasConversation = Boolean(conversationByParticipantId.get(person.id));
                      return (
                        <button
                          key={person.id}
                          onClick={() => openUserConversation(person)}
                          className="group shrink-0"
                          title={person.fullName}
                        >
                          <div className="relative mx-auto w-fit">
                            {person.avatarUrl ? (
                              <Image src={person.avatarUrl} alt="avatar" width={56} height={56} className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow-sm" />
                            ) : (
                              <div className={`h-14 w-14 bg-linear-to-br ${getAvatarColor(person.id)} rounded-full flex items-center justify-center text-white font-semibold text-base ring-2 ring-white shadow-sm`}>
                                {getInitials(person.fullName)}
                              </div>
                            )}
                            <span className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                          </div>
                          <p className="mt-1 flex w-16 items-center justify-center gap-1 text-center text-[11px] font-medium text-gray-700 group-hover:text-gray-900">
                            <span className="min-w-0 truncate">{person.fullName}</span>
                            <AdminBlueTick role={person.role} />
                          </p>
                          <p className={`text-center text-[10px] ${hasConversation ? 'text-gray-400' : 'text-red-500'}`}>
                            {hasConversation ? 'Inbox' : 'New'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* New chat user list */}
          {showNewChat && user?.role === 'ADMIN' && (
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
                      {u.avatarUrl ? (
                        <Image src={u.avatarUrl} alt="avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div
                          className={`w-8 h-8 bg-linear-to-br ${getAvatarColor(
                            u.id
                          )} rounded-full flex items-center justify-center text-white font-semibold text-xs`}
                        >
                          {getInitials(u.fullName)}
                        </div>
                      )}
                      <div className="text-left">
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                          <span>{u.fullName}</span>
                          <AdminBlueTick role={u.role} />
                        </div>
                        <div className="text-xs text-gray-500">@{u.username}</div>
                      </div>
                      {isUserShownOnline(u.id, u.role) && (
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
              <div className="px-4 py-4">
                <AdminSectionSkeleton variant="list" />
              </div>
            ) : user?.role !== 'ADMIN' ? (
              <div className="px-4 md:px-6 py-5">
                <button
                  onClick={() => {
                    if (clientLiveChatPerson) {
                      startLiveChatWithGuide();
                    } else {
                      setShowChat(true);
                    }
                  }}
                  className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                      <MessageSquarePlus className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">Live Chat</p>
                      <p className="text-xs text-gray-500">Chat with support team</p>
                    </div>
                    <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                </button>
              </div>
            ) : filteredDirectoryUsers.length === 0 ? (
              <div className="text-center py-16 px-4">
                <MessageSquarePlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {searchQuery
                    ? 'No matching users'
                    : 'No users yet'}
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
              filteredDirectoryUsers.map((person) => {
                const conv = conversationByParticipantId.get(person.id);
                const isOnline = isUserShownOnline(person.id, person.role);

                return (
                <div
                  key={person.id}
                  onClick={() => openUserConversation(person)}
                  className={`px-4 md:px-6 py-4 cursor-pointer transition-all relative ${
                    selectedConversation?.participant.id === person.id
                      ? 'bg-red-50 border-r-4 border-r-red-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="relative shrink-0">
                      {person.avatarUrl ? (
                        <Image src={person.avatarUrl} alt="avatar" width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div
                          className={`w-12 h-12 bg-linear-to-br ${getAvatarColor(person.id)} rounded-full flex items-center justify-center text-white font-semibold text-sm`}
                        >
                          {getInitials(person.fullName)}
                        </div>
                      )}
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-300'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="flex items-center gap-1 font-semibold text-gray-900 text-sm">
                            <span>{person.fullName}</span>
                            <AdminBlueTick role={person.role} />
                          </h3>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {person.role === 'ADMIN' ? 'Admin' : 'User'}
                            </span>
                            <span className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-gray-400'}`}>
                              {isOnline ? 'Active now' : 'Offline'}
                            </span>
                          </div>
                        </div>
                        {conv?.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {(conv?.unreadCount ?? 0) > 0 && (
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {conv?.unreadCount} unread messages
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>

        {/* ───────────────────── Chat Area ─────────────────────────── */}
        <div
          className={`flex-1 flex flex-col bg-gray-50 min-w-0 ${
            showChat ? 'flex' : 'hidden sm:flex'
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-gray-50 border-b border-gray-100 px-4 md:px-8 py-3 md:py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowChat(false)}
                      className="sm:hidden p-1.5 -ml-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="relative">
                      {selectedConversation.participant.avatarUrl ? (
                        <Image src={selectedConversation.participant.avatarUrl} alt="avatar" width={48} height={48} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover" />
                      ) : (
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 bg-linear-to-br ${getAvatarColor(
                            selectedConversation.participant.id
                          )} rounded-full flex items-center justify-center text-white font-semibold text-sm`}
                        >
                          {getInitials(selectedConversation.participant.fullName)}
                        </div>
                      )}
                      {isUserShownOnline(selectedConversation.participant.id, selectedConversation.participant.role) && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="flex items-center gap-1 font-semibold text-gray-900 text-base md:text-lg leading-tight">
                        <span>
                          {user?.role === 'ADMIN' ? selectedConversation.participant.fullName : 'Live Chat'}
                        </span>
                        {user?.role === 'ADMIN' && <AdminBlueTick role={selectedConversation.participant.role} />}
                      </h2>
                      <p className="text-xs md:text-sm font-medium">
                        {typingText ? (
                          <span className="text-red-500 animate-pulse">{typingText}</span>
                        ) : isUserShownOnline(selectedConversation.participant.id, selectedConversation.participant.role) ? (
                          <span className="text-green-600">Active Now</span>
                        ) : (
                          <span className="text-gray-400">Offline</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {user?.role === 'ADMIN' && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          selectedConversation.participant.role === 'ADMIN'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {selectedConversation.participant.role === 'ADMIN' ? 'Admin' : 'User'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
              {loadingMessages ? (
                <AdminSectionSkeleton variant="chatThread" />
              ) : (
                <>
                  {visibleMessages.length === 0 ? (
                    !isClientLiveChatConversation && (
                      <div className="flex items-center justify-center py-16 text-center">
                        <div>
                          {selectedConversation.participant.avatarUrl ? (
                            <Image src={selectedConversation.participant.avatarUrl} alt="avatar" width={64} height={64} className="w-16 h-16 mx-auto mb-3 rounded-full object-cover" />
                          ) : (
                            <div
                              className={`w-16 h-16 mx-auto mb-3 bg-linear-to-br ${getAvatarColor(
                                selectedConversation.participant.id
                              )} rounded-full flex items-center justify-center text-white font-bold text-xl`}
                            >
                              {getInitials(selectedConversation.participant.fullName)}
                            </div>
                          )}
                          <p className="text-gray-500 text-sm">
                            Start your conversation with{' '}
                            <span className="inline-flex items-center gap-1 font-semibold">
                                <span>
                                  {user?.role === 'ADMIN' ? selectedConversation.participant.fullName : 'Live Chat'}
                                </span>
                                {user?.role === 'ADMIN' && <AdminBlueTick role={selectedConversation.participant.role} />}
                            </span>
                          </p>
                        </div>
                      </div>
                    )
                  ) : (
                    visibleMessages.map((message) => {
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
                          selectedConversation?.participant.avatarUrl ? (
                            <Image src={selectedConversation.participant.avatarUrl} alt="avatar" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full object-cover" />
                          ) : (
                            <div
                              className={`w-8 h-8 md:w-10 md:h-10 shrink-0 bg-linear-to-br ${getAvatarColor(
                                message.sender.id
                              )} rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-sm`}
                            >
                              {getInitials(message.sender.fullName)}
                            </div>
                          )
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
                </>
              )}

              {/* Typing indicator */}
              {typingText && (
                <div className="flex justify-start">
                  <div className="flex gap-2 items-end">
                    {selectedConversation.participant.avatarUrl ? (
                      <Image src={selectedConversation.participant.avatarUrl} alt="avatar" width={32} height={32} className="w-8 h-8 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div
                        className={`w-8 h-8 shrink-0 bg-linear-to-br ${getAvatarColor(
                          selectedConversation.participant.id
                        )} rounded-full flex items-center justify-center text-white font-semibold text-xs`}
                      >
                        {getInitials(selectedConversation.participant.fullName)}
                      </div>
                    )}
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

              {/* ─── Inline Boost Form ───────────────────── */}
              {showBoostForm && user?.role !== 'ADMIN' && (
                <div className="flex justify-start">
                  <div className="w-full max-w-sm">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden">
                      {boostSuccess ? (
                        <div className="p-6 text-center">
                          <div className="w-14 h-14 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                            <Check className="w-7 h-7 text-green-600" />
                          </div>
                          <h3 className="text-base font-bold text-gray-900 mb-1">{boostLabels.success}</h3>
                          <button onClick={() => setShowBoostForm(false)} className="mt-3 px-5 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors">
                            {boostLabels.close}
                          </button>
                        </div>
                      ) : boostStep === 0 ? (
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-linear-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                              <Rocket className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">{boostLabels.langTitle}</h3>
                          </div>
                          <p className="text-xs text-gray-500 mb-4">Choose your preferred language</p>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <button
                              onClick={() => setBoostLang('en')}
                              className={`p-3 rounded-xl border-2 text-center transition-all ${boostLang === 'en' ? 'border-red-500 bg-red-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                              <span className="text-xl mb-0.5 block">🇬🇧</span>
                              <span className="text-xs font-semibold text-gray-900">English</span>
                            </button>
                            <button
                              onClick={() => setBoostLang('bn')}
                              className={`p-3 rounded-xl border-2 text-center transition-all ${boostLang === 'bn' ? 'border-red-500 bg-red-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                              <span className="text-xl mb-0.5 block">🇧🇩</span>
                              <span className="text-xs font-semibold text-gray-900">বাংলা</span>
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setShowBoostForm(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                              {boostLabels.cancel}
                            </button>
                            <button onClick={() => { setBoostStep(1); setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100); }} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600 transition-colors">
                              {boostLabels.next} →
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-linear-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                <Rocket className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-gray-900">{boostLabels.title}</h3>
                                <p className="text-[11px] text-gray-500">{boostLang === 'bn' ? 'নিচের তথ্যগুলো পূরণ করুন' : 'Fill in the details below'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-5 space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">{boostLabels.postLink} <span className="text-red-500">*</span></label>
                              <input
                                type="url"
                                value={boostData.postLink}
                                onChange={e => setBoostData(p => ({ ...p, postLink: e.target.value }))}
                                placeholder={boostLabels.postLinkPlaceholder}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{boostLabels.totalBudget} <span className="text-red-500">*</span></label>
                                <input
                                  type="text"
                                  value={boostData.totalBudget}
                                  onChange={e => setBoostData(p => ({ ...p, totalBudget: e.target.value }))}
                                  placeholder={boostLabels.totalBudgetPlaceholder}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{boostLabels.dailyBudget} <span className="text-red-500">*</span></label>
                                <input
                                  type="text"
                                  value={boostData.dailyBudget}
                                  onChange={e => setBoostData(p => ({ ...p, dailyBudget: e.target.value }))}
                                  placeholder={boostLabels.dailyBudgetPlaceholder}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">{boostFieldLabels.placement} <span className="text-red-500">*</span></label>
                              <div className="grid grid-cols-3 gap-2">
                                {placementOptions.map((option) => {
                                  const isSelected = boostData.placements.includes(option.value);
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => togglePlacement(option.value)}
                                      className={`rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors ${
                                        isSelected
                                          ? 'border-red-500 bg-red-50 text-red-700'
                                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                      }`}
                                    >
                                      {option.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">{boostFieldLabels.location} <span className="text-red-500">*</span></label>
                                <div className="relative">
                                  <select
                                    value={boostData.location}
                                    onChange={e => setBoostData(p => ({ ...p, location: e.target.value as BoostLocation }))}
                                    className="w-full appearance-none px-3 py-2 pr-8 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
                                  >
                                    {locationOptions.map((option) => (
                                      <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 whitespace-nowrap">{boostFieldLabels.minAge} / {boostFieldLabels.maxAge} <span className="text-red-500">*</span></label>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="relative">
                                    <select
                                      value={boostData.minAge}
                                      onChange={e => {
                                        const nextMin = Math.max(18, Number.parseInt(e.target.value || '18', 10) || 18);
                                        setBoostData((prev) => {
                                          const prevMax = Number.parseInt(prev.maxAge || '', 10);
                                          const nextMax = Number.isFinite(prevMax) ? String(Math.max(nextMin, prevMax)) : '';
                                          return { ...prev, minAge: String(nextMin), maxAge: nextMax };
                                        });
                                      }}
                                      className="w-full appearance-none px-3 py-2 pr-8 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
                                    >
                                      {Array.from({ length: 48 }, (_, i) => 18 + i).map((age) => (
                                        <option key={`min-age-${age}`} value={String(age)}>{age}</option>
                                      ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                  </div>
                                  <div className="relative">
                                    <select
                                      value={boostData.maxAge}
                                      onChange={e => setBoostData((prev) => ({ ...prev, maxAge: e.target.value }))}
                                      className="w-full appearance-none px-3 py-2 pr-8 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
                                    >
                                      <option value="">{boostLang === 'bn' ? 'ওপেন' : 'Open'}</option>
                                      {Array.from({ length: 48 }, (_, i) => 18 + i)
                                        .filter((age) => age >= normalizedMinAge)
                                        .map((age) => (
                                          <option key={`max-age-${age}`} value={String(age)}>{age}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">{boostFieldLabels.gender} <span className="text-red-500">*</span></label>
                              <div className="relative">
                                <select
                                  value={boostData.gender}
                                  onChange={e => setBoostData(p => ({ ...p, gender: e.target.value as BoostGender }))}
                                  className="w-full appearance-none px-3 py-2 pr-8 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
                                >
                                  {genderOptions.map((option) => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">{boostFieldLabels.audienceLanguage} <span className="text-red-500">*</span></label>
                              <div className="grid grid-cols-3 gap-2">
                                {audienceLanguageOptions.map((option) => {
                                  const isSelected = boostData.audienceLanguages.includes(option.value);
                                  return (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => toggleAudienceLanguage(option.value)}
                                      className={`rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors ${
                                        isSelected
                                          ? 'border-red-500 bg-red-50 text-red-700'
                                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                      }`}
                                    >
                                      {option.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">{boostFieldLabels.notes}</label>
                              <textarea
                                value={boostData.notes}
                                onChange={e => setBoostData(p => ({ ...p, notes: e.target.value }))}
                                placeholder={boostFieldLabels.notesPlaceholder}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 px-5 pb-5">
                            <button onClick={() => setBoostStep(0)} disabled={boostSubmitting} className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                              ← {boostLabels.back}
                            </button>
                            <button
                              onClick={handleBoostSubmit}
                              disabled={boostSubmitting || !canSubmitBoost}
                              className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
                            >
                              {boostSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                              {boostLabels.submit}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isClientLiveChatConversation && showLiveChatGuide && (
                <LiveChatGuidedFlow
                  userFullName={user?.fullName || 'Customer'}
                  timestampLabel={liveChatOnboardingTime}
                  selectedLanguage={liveChatLanguage}
                  selectedOptionId={selectedServiceOption?.id ?? null}
                  options={SERVICE_DESK_OPTIONS}
                  onLanguageSelect={handleLiveChatLanguageSelect}
                  onOptionSelect={handleLiveChatTopicSelect}
                />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-gray-50 px-3 md:px-8 py-3 md:py-4">
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
                    <Image
                      src={pendingFile.preview}
                      alt="Preview"
                      width={64}
                      height={64}
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
                  {/* Quick process button — visible only for non-admin users */}
                  {user?.role !== 'ADMIN' && isClientLiveChatConversation && (
                    <button
                      onClick={reopenLiveChatGuide}
                      aria-label="Open Quick Process"
                      title="Open Quick Process"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white shadow-sm shadow-red-200/70 transition-all hover:bg-red-600 active:scale-95"
                    >
                      <MessageSquarePlus className="h-5 w-5" />
                    </button>
                  )}

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
            <div className="flex-1 overflow-y-auto">
              {user?.role === 'ADMIN' ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquarePlus className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                      Select a conversation
                    </h3>
                    <p className="text-sm text-gray-500">Choose a user to start chatting</p>
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex h-full w-full max-w-xl items-center justify-center px-4 py-8 md:px-10">
                  <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                        <MessageSquarePlus className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Live Chat</h3>
                      <p className="mt-1 text-sm text-gray-500">Open your support chat to continue.</p>

                      <button
                        onClick={() => {
                          if (clientLiveChatPerson) {
                            startLiveChatWithGuide();
                          }
                        }}
                        disabled={!clientLiveChatPerson}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Start Live Chat
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
    </AdminShell>
  );
}
