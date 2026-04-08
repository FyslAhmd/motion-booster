'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [isConnected, setIsConnected] = useState(false);
  const shouldEnable = enabled && Boolean(token);

  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!shouldEnable || !token) {
      return;
    }

    const socket = io({
      path: '/api/socket',
      auth: { token },
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleConnectError = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

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
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.disconnect();
    };
  }, [shouldEnable, token]);

  return shouldEnable && isConnected;
}
