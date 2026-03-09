import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

// ─── GET /api/v1/chat/conversations ─────────────────
// Returns the user's conversations.
// - ADMIN: gets ALL conversations
// - USER: gets only conversations where they are a participant
export async function GET(req: NextRequest) {
  try {
    const user = await validateRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { id: user.id } },
      },
      include: {
        participants: {
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
            avatarUrl: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            content: true,
            createdAt: true,
            sender: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Count unread messages per conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: user.id },
            status: { not: 'READ' },
          },
        });

        // Get the "other" participant (the person you're chatting with)
        const otherParticipant = conv.participants.find((p) => p.id !== user.id);

        return {
          id: conv.id,
          participant: otherParticipant || conv.participants[0],
          lastMessage: conv.messages[0] || null,
          unreadCount,
          updatedAt: conv.updatedAt,
          createdAt: conv.createdAt,
        };
      })
    );

    return NextResponse.json({ conversations: conversationsWithUnread });
  } catch (error) {
    console.error('GET /conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// ─── POST /api/v1/chat/conversations ────────────────
// Create or find an existing conversation between two users.
// Body: { participantId: string }
// Rules:
// - USER can only start conversations with ADMIN
// - ADMIN can start conversations with any USER
export async function POST(req: NextRequest) {
  try {
    const user = await validateRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { participantId } = body;

    if (!participantId) {
      return NextResponse.json(
        { error: 'participantId is required' },
        { status: 400 }
      );
    }

    if (participantId === user.id) {
      return NextResponse.json(
        { error: 'Cannot start a conversation with yourself' },
        { status: 400 }
      );
    }

    // Look up the target participant
    const targetUser = await prisma.user.findUnique({
      where: { id: participantId },
      select: { id: true, username: true, fullName: true, role: true, status: true, avatarUrl: true },
    });

    if (!targetUser || targetUser.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 404 }
      );
    }

    // ─── Access rules ─────────────────────────────────
    if (user.role === 'USER' && targetUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Users can only message admin' },
        { status: 403 }
      );
    }

    if (user.role === 'ADMIN' && targetUser.role !== 'USER') {
      return NextResponse.json(
        { error: 'Admin can only message users' },
        { status: 403 }
      );
    }

    // ─── Check for existing conversation ──────────────
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: user.id } } },
          { participants: { some: { id: participantId } } },
        ],
      },
      include: {
        participants: {
          select: { id: true, username: true, fullName: true, role: true, avatarUrl: true },
        },
      },
    });

    if (existing) {
      return NextResponse.json({ conversation: existing });
    }

    // ─── Create new conversation ──────────────────────
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: user.id }, { id: participantId }],
        },
      },
      include: {
        participants: {
          select: { id: true, username: true, fullName: true, role: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error('POST /conversations error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
