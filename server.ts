import { createServer } from 'http';
import { parse } from 'url';
import { join, extname } from 'path';
import { existsSync, createReadStream, statSync } from 'fs';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { jwtVerify } from 'jose';
import { PrismaClient } from './lib/generated/prisma/index.js';
import { notificationBus, type LiveNotificationEvent } from './lib/server/notification-bus.js';
import { chatBus, type LiveChatMessageEvent } from './lib/server/chat-bus.js';
import 'dotenv/config';

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const prisma = new PrismaClient();

const ALLOWED_SOCKET_ORIGINS = [
  'https://motionbooster.com',
  'https://www.motionbooster.com',
  'http://motionbooster.com',
  'http://www.motionbooster.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://localhost:3000',
].map((v) => v.replace(/\/$/, ''));

// ─── JWT verification for socket auth ─────────────────
function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');
  return new TextEncoder().encode(secret);
}

async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getAccessSecret());
  if (payload.type !== 'access') throw new Error('Invalid token type');
  return payload as { userId: string; role: string; type: string };
}

// ─── Track online users: userId -> Set<socketId> ──────
const onlineUsers = new Map<string, Set<string>>();

// ─── MIME types for static file serving ───────────────
const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.pdf': 'application/pdf', '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv', '.txt': 'text/plain',
  '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4',
};

function getChatNotificationCopy(input: {
  senderName: string;
  messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'VOICE';
  content?: string;
}) {
  const rawContent = (input.content || '').trim();
  if (input.messageType === 'TEXT') {
    const preview = rawContent.length > 100 ? `${rawContent.slice(0, 100)}...` : rawContent;
    return {
      title: `New message from ${input.senderName}`,
      text: preview || `${input.senderName} sent you a message.`,
    };
  }

  const labelByType: Record<'IMAGE' | 'VIDEO' | 'FILE' | 'VOICE', string> = {
    IMAGE: 'an image',
    VIDEO: 'a video',
    FILE: 'a file',
    VOICE: 'a voice message',
  };

  return {
    title: `New message from ${input.senderName}`,
    text: `${input.senderName} sent ${labelByType[input.messageType]}.`,
  };
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    const pathname = parsedUrl.pathname || '';

    // ─── Serve uploaded files from /uploads/* ─────────────
    if (pathname.startsWith('/uploads/')) {
      // Prevent directory traversal
      const safePath = pathname.replace(/\.\./g, '');
      const filePath = join(process.cwd(), safePath);

      if (existsSync(filePath)) {
        try {
          const stat = statSync(filePath);
          const ext = extname(filePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || 'application/octet-stream';

          res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stat.size,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*',
          });
          createReadStream(filePath).pipe(res);
          return;
        } catch {
          res.writeHead(500);
          res.end('Internal Server Error');
          return;
        }
      } else {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
    }

    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    cors: {
      origin: (origin, callback) => {
        // Allow same-origin / server-to-server requests with no Origin header.
        if (!origin) return callback(null, true);

        const normalized = origin.replace(/\/$/, '');
        if (ALLOWED_SOCKET_ORIGINS.includes(normalized)) {
          return callback(null, true);
        }

        return callback(new Error(`Socket origin not allowed: ${origin}`));
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  notificationBus.on('notification:new', (event: LiveNotificationEvent) => {
    io.to(`user:${event.userId}`).emit('notification:new', event.notification);
  });

  chatBus.on('chat:message:new', (event: LiveChatMessageEvent) => {
    const userIds = Array.from(new Set(event.participantUserIds));
    userIds.forEach((userId) => {
      io.to(`user:${userId}`).emit('message:receive', event.message);
    });
  });

  // ─── Socket.IO auth middleware ────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = await verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, username: true, fullName: true, role: true, status: true },
      });

      if (!user || user.status !== 'ACTIVE') {
        return next(new Error('User not found or inactive'));
      }

      socket.data.user = user;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`🟢 ${user.fullName} (${user.role}) connected [${socket.id}]`);

    // Track online status
    if (!onlineUsers.has(user.id)) {
      onlineUsers.set(user.id, new Set());
    }
    onlineUsers.get(user.id)!.add(socket.id);

    // Join user's personal room
    socket.join(`user:${user.id}`);

    // Broadcast online status
    io.emit('user:online', { userId: user.id });

    // ─── Send message ───────────────────────────────────
    socket.on('message:send', async (data, callback) => {
      try {
        const {
          conversationId,
          content,
          messageType = 'TEXT',
          fileUrl,
          fileName,
          fileSize,
          mimeType,
          duration,
        } = data;

        // For TEXT messages, content is required. For file/voice, content is optional (caption).
        if (!conversationId) {
          return callback?.({ error: 'Missing conversationId' });
        }
        if (messageType === 'TEXT' && !content?.trim()) {
          return callback?.({ error: 'Missing content for text message' });
        }
        if (messageType !== 'TEXT' && !fileUrl) {
          return callback?.({ error: 'Missing fileUrl for non-text message' });
        }

        // Verify sender is a participant of this conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            participants: { some: { id: user.id } },
          },
          include: {
            participants: { select: { id: true, role: true } },
          },
        });

        if (!conversation) {
          return callback?.({ error: 'Conversation not found or access denied' });
        }

        // RULE: Users can only chat with ADMIN
        if (user.role === 'USER') {
          const hasAdmin = conversation.participants.some((p) => p.role === 'ADMIN');
          if (!hasAdmin) {
            return callback?.({ error: 'Users can only message admin' });
          }
        }

        // Save message to DB
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: user.id,
            content: content?.trim() || '',
            status: 'SENT',
          },
          include: {
            sender: {
              select: { id: true, username: true, fullName: true, role: true },
            },
          },
        });

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        // Emit to all participants in the conversation
        for (const participant of conversation.participants) {
          io.to(`user:${participant.id}`).emit('message:receive', message);
        }

        // Persist bell notifications + instant live notifications for recipients.
        const recipientIds = conversation.participants
          .map((participant) => participant.id)
          .filter((participantId) => participantId !== user.id);

        if (recipientIds.length > 0) {
          const copy = getChatNotificationCopy({
            senderName: user.fullName,
            messageType,
            content,
          });

          await Promise.all(
            recipientIds.map(async (recipientId) => {
              const notification = await prisma.notification.create({
                data: {
                  userId: recipientId,
                  type: 'GENERAL',
                  title: copy.title,
                  text: copy.text,
                  href: '/dashboard/chat',
                  metadata: {
                    module: 'chat',
                    type: 'CHAT_MESSAGE',
                    senderId: user.id,
                    senderName: user.fullName,
                    conversationId,
                    messageId: message.id,
                    messageType,
                  },
                },
              });

              io.to(`user:${recipientId}`).emit('notification:new', {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                text: notification.text,
                href: notification.href || '/dashboard/chat',
                createdAt: notification.createdAt.toISOString(),
              });
            }),
          );
        }

        callback?.({ success: true, message });
      } catch (err) {
        console.error('message:send error:', err);
        callback?.({ error: 'Failed to send message' });
      }
    });

    // ─── Typing indicators ──────────────────────────────
    socket.on('typing:start', async (data) => {
      const { conversationId } = data;
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participants: { some: { id: user.id } },
        },
        include: { participants: { select: { id: true } } },
      });

      if (!conversation) return;

      for (const participant of conversation.participants) {
        if (participant.id !== user.id) {
          io.to(`user:${participant.id}`).emit('typing:start', {
            conversationId,
            userId: user.id,
            fullName: user.fullName,
          });
        }
      }
    });

    socket.on('typing:stop', async (data) => {
      const { conversationId } = data;
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participants: { some: { id: user.id } },
        },
        include: { participants: { select: { id: true } } },
      });

      if (!conversation) return;

      for (const participant of conversation.participants) {
        if (participant.id !== user.id) {
          io.to(`user:${participant.id}`).emit('typing:stop', {
            conversationId,
            userId: user.id,
          });
        }
      }
    });

    // ─── Mark messages as read ──────────────────────────
    socket.on('message:read', async (data) => {
      const { conversationId } = data;

      // Mark all messages in this conversation as READ (except own)
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: user.id },
          status: { not: 'READ' },
        },
        data: { status: 'READ' },
      });

      // Notify the other participants
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participants: { some: { id: user.id } },
        },
        include: { participants: { select: { id: true } } },
      });

      if (conversation) {
        for (const participant of conversation.participants) {
          if (participant.id !== user.id) {
            io.to(`user:${participant.id}`).emit('message:read', {
              conversationId,
              readBy: user.id,
            });
          }
        }
      }
    });

    // ─── Disconnect ─────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔴 ${user.fullName} disconnected [${socket.id}]`);

      const userSockets = onlineUsers.get(user.id);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(user.id);
          io.emit('user:offline', { userId: user.id });
        }
      }
    });

    // ─── Get online users ───────────────────────────────
    socket.on('users:online', (callback) => {
      callback?.(Array.from(onlineUsers.keys()));
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`\n  ▲ Server ready on http://${hostname}:${port}`);
    console.log(`  ⚡ Socket.IO running on /api/socket\n`);
  });
});
