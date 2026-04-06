'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import type { AppNotification } from '@/lib/notifications/types';

interface UseLiveNotificationsInput {
  token: string | null;
  enabled: boolean;
  onNotification: (notification: AppNotification) => void;
}

export function useLiveNotifications(input: UseLiveNotificationsInput) {
  const { token, enabled, onNotification } = input;
  const callbackRef = useRef(onNotification);

  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!enabled || !token) return;

    const socket = io({
      path: '/api/socket',
      auth: { token },
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    // Delay connect slightly so React dev strict-mode mount/unmount cycles
    // do not start and immediately tear down the websocket handshake.
    const connectTimer = window.setTimeout(() => {
      socket.connect();
    }, 50);

    socket.on('notification:new', (notification: AppNotification) => {
      callbackRef.current(notification);
    });

    return () => {
      window.clearTimeout(connectTimer);
      socket.disconnect();
    };
  }, [enabled, token]);
}
