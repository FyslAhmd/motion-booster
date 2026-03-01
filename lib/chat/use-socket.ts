'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
  token: string | null;
  onMessage?: (message: ChatMessage) => void;
  onTypingStart?: (data: TypingData) => void;
  onTypingStop?: (data: { conversationId: string; userId: string }) => void;
  onMessageRead?: (data: { conversationId: string; readBy: string }) => void;
  onUserOnline?: (data: { userId: string }) => void;
  onUserOffline?: (data: { userId: string }) => void;
}

export type MessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'VOICE';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  duration?: number | null;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
  sender: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  };
}

export interface TypingData {
  conversationId: string;
  userId: string;
  fullName: string;
}

export function useSocket({
  token,
  onMessage,
  onTypingStart,
  onTypingStop,
  onMessageRead,
  onUserOnline,
  onUserOffline,
}: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!token) return;

    const socket = io({
      path: '/api/socket',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Request online users list
      socket.emit('users:online', (userIds: string[]) => {
        setOnlineUsers(new Set(userIds));
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('message:receive', (message: ChatMessage) => {
      onMessage?.(message);
    });

    socket.on('typing:start', (data: TypingData) => {
      onTypingStart?.(data);
    });

    socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
      onTypingStop?.(data);
    });

    socket.on('message:read', (data: { conversationId: string; readBy: string }) => {
      onMessageRead?.(data);
    });

    socket.on('user:online', (data: { userId: string }) => {
      setOnlineUsers((prev) => new Set([...prev, data.userId]));
      onUserOnline?.(data);
    });

    socket.on('user:offline', (data: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
      onUserOffline?.(data);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const sendMessage = useCallback(
    (
      conversationId: string,
      content: string,
      metadata?: {
        messageType?: MessageType;
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
        mimeType?: string;
        duration?: number;
      },
      callback?: (response: { success?: boolean; message?: ChatMessage; error?: string }) => void
    ) => {
      socketRef.current?.emit(
        'message:send',
        { conversationId, content, ...metadata },
        callback
      );
    },
    []
  );

  const startTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:start', { conversationId });
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit('typing:stop', { conversationId });
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    socketRef.current?.emit('message:read', { conversationId });
  }, []);

  return {
    isConnected,
    onlineUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
  };
}
