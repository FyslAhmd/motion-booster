import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

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
          select: { id: true, username: true, fullName: true, role: true },
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

    // For TEXT messages, content is required. For file/voice, content is optional.
    if (messageType === 'TEXT' && !content?.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }
    if (messageType !== 'TEXT' && !fileUrl) {
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
        content: content?.trim() || '',
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize ? Number(fileSize) : null,
        mimeType: mimeType || null,
        duration: duration ? Number(duration) : null,
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

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('POST /messages error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
