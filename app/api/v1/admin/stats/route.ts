import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const [totalClients, unseenMessages] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      // Messages sent by clients (USER role) that haven't been READ by admin yet
      prisma.message.count({
        where: {
          status: { not: 'READ' },
          sender: { role: 'USER' },
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: { totalClients, unseenMessages } });
  } catch (error) {
    console.error('[admin stats]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
