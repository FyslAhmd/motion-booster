import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawLimit = Number(searchParams.get('limit') || 50);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(200, rawLimit)) : 50;
    const search = searchParams.get('search')?.trim() || '';

    const where = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { mobile: { contains: search } },
            { queryDetails: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        fullName: true,
        email: true,
        companyName: true,
        mobile: true,
        queryDetails: true,
        source: true,
        isRead: true,
        createdAt: true,
      },
    });

    const uniqueEmails = Array.from(
      new Set(
        messages
          .map((message) => message.email.trim().toLowerCase())
          .filter(Boolean),
      ),
    );

    const users = uniqueEmails.length
      ? await prisma.user.findMany({
          where: { email: { in: uniqueEmails } },
          select: { email: true, avatarUrl: true },
        })
      : [];

    const avatarByEmail = new Map(
      users.map((user) => [user.email.trim().toLowerCase(), user.avatarUrl]),
    );

    const messagesWithAvatar = messages.map((message) => ({
      ...message,
      avatarUrl: avatarByEmail.get(message.email.trim().toLowerCase()) ?? null,
    }));

    return NextResponse.json({ success: true, data: messagesWithAvatar });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return NextResponse.json(
        { success: false, error: 'contact_messages table is missing. Please run the latest migration.' },
        { status: 500 },
      );
    }

    console.error('[admin contact-messages GET]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to fetch contact messages' },
      { status: 500 },
    );
  }
}
