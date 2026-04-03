import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [totalClients, unseenMessages, pendingBoostRequests] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      // Count unread client messages for this admin's conversations only.
      prisma.message.count({
        where: {
          status: { not: 'READ' },
          sender: { role: 'USER' },
          conversation: {
            participants: {
              some: { id: auth.id },
            },
          },
        },
      }),
      prisma.boostRequest.count({
        where: {
          completed: false,
          AND: [
            {
              NOT: {
                targetAudience: {
                  contains: 'status: completed',
                  mode: 'insensitive',
                },
              },
            },
            {
              NOT: {
                targetAudience: {
                  contains: 'status: cancelled',
                  mode: 'insensitive',
                },
              },
            },
            {
              NOT: {
                targetAudience: {
                  contains: 'status: canceled',
                  mode: 'insensitive',
                },
              },
            },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { totalClients, unseenMessages, pendingBoostRequests },
    });
  } catch (error) {
    console.error('[admin stats]', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
