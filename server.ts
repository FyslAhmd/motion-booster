import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import { jwtVerify } from 'jose';
import { PrismaClient } from './lib/generated/prisma/index.js';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const prisma = new PrismaClient();

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

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
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
        const { conversationId, content } = data;

        if (!conversationId || !content?.trim()) {
          return callback?.({ error: 'Missing conversationId or content' });
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
            content: content.trim(),
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

  httpServer.listen(port, () => {
    console.log(`\n  ▲ Server ready on http://${hostname}:${port}`);
    console.log(`  ⚡ Socket.IO running on /api/socket\n`);
  });
});
