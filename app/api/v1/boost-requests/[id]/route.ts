import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/auth/require-admin';
import { chatBus } from '@/lib/server/chat-bus';
import { createNotification } from '@/lib/server/notifications';

type PlacementValue = 'facebook' | 'instagram' | 'whatsapp';
type LocationValue = string;
type GenderValue = 'male' | 'female' | 'both';
type BoostRequestStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

type NormalizedBoostSetup = {
  placements: PlacementValue[];
  location: LocationValue | null;
  minAge: number | null;
  maxAge: number | null;
  gender: GenderValue | null;
};

const PLACEMENT_LABELS: Record<PlacementValue, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
};

const GENDER_LABELS: Record<GenderValue, string> = {
  male: 'Male',
  female: 'Female',
  both: 'Both',
};

const STATUS_LABELS: Record<BoostRequestStatus, string> = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const uniqueValues = <T,>(values: T[]): T[] => {
  const seen = new Set<T>();
  const output: T[] = [];
  values.forEach((value) => {
    if (seen.has(value)) return;
    seen.add(value);
    output.push(value);
  });
  return output;
};

const normalizePlacement = (value: unknown): PlacementValue | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.toLowerCase().trim();
  if (normalized === 'facebook' || normalized === 'instagram' || normalized === 'whatsapp') {
    return normalized;
  }
  return null;
};

const normalizeLocation = (value: unknown): LocationValue | null => {
  if (typeof value !== 'string') return null;
  const raw = value.trim();
  if (!raw) return null;
  const normalized = raw.toLowerCase();
  if (normalized === 'all_country' || normalized === 'all country' || normalized === 'all countries') return 'All Country';
  if (normalized === 'bangladesh' || normalized === 'bangladesh (bd)' || normalized === 'bd') return 'Bangladesh (BD)';
  return raw.slice(0, 120);
};

const normalizeGender = (value: unknown): GenderValue | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.toLowerCase().trim();
  if (normalized === 'male' || normalized === 'female' || normalized === 'both') return normalized;
  return null;
};

const normalizeAge = (value: unknown): number | null => {
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number.parseInt(value, 10)
      : Number.NaN;
  if (!Number.isFinite(parsed)) return null;
  return Math.max(18, Math.min(65, Math.trunc(parsed)));
};

const normalizeBoostSetup = (payload: Record<string, unknown>): NormalizedBoostSetup => {
  const placements = Array.isArray(payload.placements)
    ? uniqueValues(payload.placements.map(normalizePlacement).filter((value): value is PlacementValue => Boolean(value)))
    : [];

  const location = normalizeLocation(payload.location);
  const minAge = normalizeAge(payload.minAge);
  const normalizedMaxAge = normalizeAge(payload.maxAge);
  const maxAge = normalizedMaxAge !== null && minAge !== null
    ? Math.max(minAge, normalizedMaxAge)
    : normalizedMaxAge;
  const gender = normalizeGender(payload.gender);

  return {
    placements,
    location,
    minAge,
    maxAge,
    gender,
  };
};

const buildSetupLines = (setup: NormalizedBoostSetup): string[] => {
  const lines: string[] = [];
  if (setup.placements.length > 0) {
    lines.push(`Placements: ${setup.placements.map((value) => PLACEMENT_LABELS[value]).join(', ')}`);
  }
  if (setup.location) {
    lines.push(`Location: ${setup.location}`);
  }
  if (setup.minAge !== null) {
    if (setup.maxAge !== null) {
      lines.push(`Age: ${setup.minAge}-${setup.maxAge}`);
    } else {
      lines.push(`Age: ${setup.minAge}+`);
    }
  }
  if (setup.gender) {
    lines.push(`Gender: ${GENDER_LABELS[setup.gender]}`);
  }
  return lines;
};

const mergeTargetAudienceSetup = (current: string, setup: NormalizedBoostSetup): string => {
  const currentLines = current
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const preservedLines = currentLines.filter(
    (line) => !/^(placement|placements|location|age|gender)\s*[:\-]/i.test(line),
  );
  return [...buildSetupLines(setup), ...preservedLines].join('\n').trim();
};

const normalizeStatus = (value: unknown): BoostRequestStatus | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.toUpperCase().trim();
  if (normalized === 'PENDING' || normalized === 'COMPLETED' || normalized === 'CANCELLED') {
    return normalized;
  }
  return null;
};

const mergeTargetAudienceStatus = (current: string, status: BoostRequestStatus): string => {
  const currentLines = current
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const preservedLines = currentLines.filter((line) => !/^status\s*[:\-]/i.test(line));
  return [`Status: ${STATUS_LABELS[status]}`, ...preservedLines].join('\n').trim();
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

async function pushAdminMessageToChat(input: {
  adminId: string;
  adminName: string;
  targetUserId: string;
  content: string;
  req: NextRequest;
}) {
  if (!input.content.trim()) return null;

  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { id: input.adminId } } },
        { participants: { some: { id: input.targetUserId } } },
      ],
    },
    include: {
      participants: {
        select: { id: true },
      },
    },
  });

  const conversation = existingConversation || await prisma.conversation.create({
    data: {
      participants: {
        connect: [{ id: input.adminId }, { id: input.targetUserId }],
      },
    },
    include: {
      participants: {
        select: { id: true },
      },
    },
  });

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: input.adminId,
      content: input.content.trim(),
      status: 'SENT',
    },
    include: {
      sender: {
        select: { id: true, username: true, fullName: true, role: true },
      },
    },
  });

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  chatBus.emit('chat:message:new', {
    participantUserIds: conversation.participants.map((participant) => participant.id),
    message,
  });

  const notificationCopy = getChatNotificationCopy({
    senderName: input.adminName,
    messageType: 'TEXT',
    content: input.content,
  });

  await createNotification({
    userId: input.targetUserId,
    type: 'GENERAL',
    title: notificationCopy.title,
    text: notificationCopy.text,
    href: '/dashboard/chat',
    logPath: input.req.nextUrl.pathname,
    logMethod: input.req.method,
    metadata: {
      module: 'chat',
      type: 'CHAT_MESSAGE',
      senderId: input.adminId,
      senderName: input.adminName,
      conversationId: conversation.id,
      messageId: message.id,
      messageType: 'TEXT',
      source: 'boost-request-admin-reply',
    },
  });

  return message;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const result = await requireAdmin(req);
  if (result instanceof NextResponse) return result;
  const admin = result;

  const { id } = await params;

  let body: Record<string, unknown> = {};
  try {
    const parsed = await req.json();
    if (!isPlainObject(parsed)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    body = parsed;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const hasCompletedUpdate = typeof body.completed === 'boolean';
  const normalizedStatus = normalizeStatus(body.status);
  const hasStatusUpdate = normalizedStatus !== null;
  const hasSetupUpdate =
    Object.prototype.hasOwnProperty.call(body, 'placements') ||
    Object.prototype.hasOwnProperty.call(body, 'location') ||
    Object.prototype.hasOwnProperty.call(body, 'minAge') ||
    Object.prototype.hasOwnProperty.call(body, 'maxAge') ||
    Object.prototype.hasOwnProperty.call(body, 'gender');
  const adminMessage = typeof body.adminMessage === 'string' ? body.adminMessage.trim() : '';
  const hasAdminMessage = adminMessage.length > 0;

  if (!hasCompletedUpdate && !hasStatusUpdate && !hasSetupUpdate && !hasAdminMessage) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const data: {
    completed?: boolean;
    completedAt?: Date | null;
    targetAudience?: string;
  } = {};

  if (hasStatusUpdate) {
    const completed = normalizedStatus === 'COMPLETED';
    data.completed = completed;
    data.completedAt = completed ? new Date() : null;
  } else if (hasCompletedUpdate) {
    const completed = Boolean(body.completed);
    data.completed = completed;
    data.completedAt = completed ? new Date() : null;
  }

  if (hasSetupUpdate || hasStatusUpdate) {
    const existing = await prisma.boostRequest.findUnique({
      where: { id },
      select: { targetAudience: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Boost request not found' }, { status: 404 });
    }

    let mergedAudience = existing.targetAudience || '';

    if (hasSetupUpdate) {
      const setup = normalizeBoostSetup(body);
      if (setup.placements.length === 0 || !setup.location || !setup.gender || setup.minAge === null) {
        return NextResponse.json({ error: 'Invalid setup options payload' }, { status: 400 });
      }
      mergedAudience = mergeTargetAudienceSetup(mergedAudience, setup);
    }

    if (hasStatusUpdate && normalizedStatus) {
      mergedAudience = mergeTargetAudienceStatus(mergedAudience, normalizedStatus);
    }

    data.targetAudience = mergedAudience;
  }

  try {
    const updated = Object.keys(data).length > 0
      ? await prisma.boostRequest.update({
          where: { id },
          data,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        })
      : await prisma.boostRequest.findUnique({
          where: { id },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        });

    if (!updated) {
      return NextResponse.json({ error: 'Boost request not found' }, { status: 404 });
    }

    let sentMessageId: string | null = null;
    if (hasAdminMessage) {
      const chatMessage = await pushAdminMessageToChat({
        adminId: admin.id,
        adminName: admin.fullName,
        targetUserId: updated.userId,
        content: adminMessage,
        req,
      });
      sentMessageId = chatMessage?.id ?? null;
    }

    return NextResponse.json({ ...updated, sentMessageId });
  } catch {
    return NextResponse.json({ error: 'Failed to update boost request' }, { status: 500 });
  }
}
