import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

/**
 * GET /api/v1/admin/meta-assignments/users
 * Returns all unique users who have at least one Meta ad assignment,
 * along with counts per object type.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Group assignments by userId + metaObjectType to get counts
    const grouped = await prisma.metaAdAssignment.groupBy({
      by: ['userId', 'metaObjectType'],
      _count: { id: true },
    });

    // Collect unique user IDs
    const userIds = [...new Set(grouped.map((g) => g.userId))];

    if (userIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch user details
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        fullName: true,
        phone: true,
        username: true,
        email: true,
        createdAt: true,
      },
    });

    // Build response: user details + counts
    const data = users.map((user) => {
      const userGroups = grouped.filter((g) => g.userId === user.id);
      const campaigns = userGroups.find((g) => g.metaObjectType === 'CAMPAIGN')?._count.id ?? 0;
      const adSets = userGroups.find((g) => g.metaObjectType === 'ADSET')?._count.id ?? 0;
      const ads = userGroups.find((g) => g.metaObjectType === 'AD')?._count.id ?? 0;

      return {
        ...user,
        counts: {
          campaigns,
          adSets,
          ads,
          total: campaigns + adSets + ads,
        },
      };
    });

    // Sort by total assignments descending
    data.sort((a, b) => b.counts.total - a.counts.total);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('[meta-assignments/users GET]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assigned users' },
      { status: 500 },
    );
  }
}
