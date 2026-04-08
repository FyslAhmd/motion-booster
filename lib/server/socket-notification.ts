import type { Server as SocketIOServer } from 'socket.io';
import type { LiveNotificationPayload } from './notification-bus';

type NotificationSocketGlobal = typeof globalThis & {
  __mbSocketIo?: SocketIOServer;
};

export function setNotificationSocketServer(io: SocketIOServer) {
  const runtimeGlobal = globalThis as NotificationSocketGlobal;
  runtimeGlobal.__mbSocketIo = io;
}

export function emitNotificationToUser(
  userId: string,
  notification: LiveNotificationPayload,
): boolean {
  const runtimeGlobal = globalThis as NotificationSocketGlobal;
  const io = runtimeGlobal.__mbSocketIo;
  if (!io) return false;

  io.to(`user:${userId}`).emit('notification:new', notification);
  return true;
}
