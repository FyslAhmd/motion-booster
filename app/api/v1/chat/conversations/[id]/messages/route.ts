import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';
import { createNotification } from '@/lib/server/notifications';
import { sendAdminChatAlertEmail } from '@/lib/server/mailer';

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

const CHAT_MESSAGE_TYPES = new Set(['TEXT', 'IMAGE', 'VIDEO', 'FILE', 'VOICE'] as const);
type ChatMessageType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'FILE' | 'VOICE';

// ─── GET /api/v1/chat/conversations/[id]/messages ───
// Returns messages for a specific conversation with pagination.
// Query params: ?cursor=<messageId>&limit=50
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await validateRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    // Verify user is a participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: user.id } },
      },
      include: {
        participants: {
          select: { id: true, username: true, fullName: true, role: true, avatarUrl: true },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    // ─── Access rule: USER can only access conversations with ADMIN ──
    if (user.role === 'USER') {
      const hasAdmin = conversation.participants.some((p) => p.role === 'ADMIN');
      if (!hasAdmin) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Treat opening a conversation as "read" even if socket read event is missed.
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: user.id },
        status: { not: 'READ' },
      },
      data: { status: 'READ' },
    });

    // Fetch messages with cursor-based pagination
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
      include: {
        sender: {
          select: { id: true, username: true, fullName: true, role: true },
        },
      },
    });

    // Get total count for the conversation
    const total = await prisma.message.count({
      where: { conversationId },
    });

    const nextCursor = messages.length === limit ? messages[messages.length - 1].id : null;

    return NextResponse.json({
      messages,
      conversation: {
        id: conversation.id,
        participants: conversation.participants,
      },
      pagination: {
        total,
        limit,
        nextCursor,
        hasMore: !!nextCursor,
      },
    });
  } catch (error) {
    console.error('GET /messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// ─── POST /api/v1/chat/conversations/[id]/messages ──
// Send a message in a conversation (REST fallback, primary is Socket.IO)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await validateRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: conversationId } = await params;
    const body = await req.json();
    const {
      content,
      messageType = 'TEXT',
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      duration,
    } = body;

    const normalizedMessageType = String(messageType || 'TEXT').toUpperCase();
    if (!CHAT_MESSAGE_TYPES.has(normalizedMessageType as ChatMessageType)) {
      return NextResponse.json(
        { error: 'Invalid message type' },
        { status: 400 }
      );
    }
    const safeMessageType = normalizedMessageType as ChatMessageType;
    const safeContent = typeof content === 'string' ? content.trim() : '';
    const safeFileUrl = typeof fileUrl === 'string' ? fileUrl.trim() : '';
    const safeFileName = typeof fileName === 'string' && fileName.trim().length > 0
      ? fileName.trim()
      : null;
    const safeMimeType = typeof mimeType === 'string' && mimeType.trim().length > 0
      ? mimeType.trim()
      : null;
    const parsedFileSize = Number(fileSize);
    const safeFileSize = Number.isFinite(parsedFileSize) && parsedFileSize > 0
      ? Math.trunc(parsedFileSize)
      : null;
    const parsedDuration = Number(duration);
    const safeDuration = Number.isFinite(parsedDuration) && parsedDuration > 0
      ? Math.trunc(parsedDuration)
      : null;

    // For TEXT messages, content is required. For file/voice, content is optional.
    if (safeMessageType === 'TEXT' && !safeContent) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }
    if (safeMessageType !== 'TEXT' && !safeFileUrl) {
      return NextResponse.json(
        { error: 'fileUrl is required for non-text messages' },
        { status: 400 }
      );
    }

    // Verify user is a participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: user.id } },
      },
      include: {
        participants: {
          select: { id: true, role: true },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found or access denied' },
        { status: 404 }
      );
    }

    // Access rule
    if (user.role === 'USER') {
      const hasAdmin = conversation.participants.some((p) => p.role === 'ADMIN');
      if (!hasAdmin) {
        return NextResponse.json(
          { error: 'Users can only message admin' },
          { status: 403 }
        );
      }
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: safeContent,
        messageType: safeMessageType,
        fileUrl: safeMessageType === 'TEXT' ? null : safeFileUrl,
        fileName: safeMessageType === 'TEXT' ? null : safeFileName,
        fileSize: safeMessageType === 'TEXT' ? null : safeFileSize,
        mimeType: safeMessageType === 'TEXT' ? null : safeMimeType,
        duration: safeMessageType === 'VOICE' ? safeDuration : null,
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

    const recipientIds = conversation.participants
      .map((participant) => participant.id)
      .filter((participantId) => participantId !== user.id);

    if (recipientIds.length > 0) {
      const copy = getChatNotificationCopy({
        senderName: message.sender.fullName,
        messageType: safeMessageType,
          content: safeContent,
      });

      await Promise.all(
        recipientIds.map((recipientId) =>
          createNotification({
            userId: recipientId,
            type: 'GENERAL',
            title: copy.title,
            text: copy.text,
            href: '/dashboard/chat',
            logPath: req.nextUrl.pathname,
            logMethod: req.method,
            metadata: {
              module: 'chat',
              type: 'CHAT_MESSAGE',
              senderId: user.id,
              senderName: message.sender.fullName,
              conversationId,
              messageId: message.id,
              messageType: safeMessageType,
            },
          }),
        ),
      );
    }

    if (user.role !== 'ADMIN') {
      try {
        await sendAdminChatAlertEmail({
          to: 'mdmehrab254.mk@gmail.com',
          senderName: message.sender.fullName,
          senderEmail: user.email,
          senderRole: user.role,
          messageType: safeMessageType,
          content: safeContent,
          conversationId,
          messageId: message.id,
          createdAt: message.createdAt,
        });
      } catch (emailError) {
        console.error('[chat admin email alert]', emailError);
      }
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('POST /messages error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
