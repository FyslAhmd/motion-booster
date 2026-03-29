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

    // Read distinct assignment rows so duplicate mapping rows don't inflate counts
    const assignments = await prisma.metaAdAssignment.findMany({
      select: {
        userId: true,
        metaObjectType: true,
        metaObjectId: true,
      },
      distinct: ['userId', 'metaObjectType', 'metaObjectId'],
    });

    // Collect unique user IDs
    const userIds = [...new Set(assignments.map((a) => a.userId))];

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
        avatarUrl: true,
      },
    });

    const countsByUser = new Map<string, { campaigns: number; adSets: number; ads: number }>();
    for (const assignment of assignments) {
      const current = countsByUser.get(assignment.userId) ?? { campaigns: 0, adSets: 0, ads: 0 };
      if (assignment.metaObjectType === 'CAMPAIGN') current.campaigns += 1;
      else if (assignment.metaObjectType === 'ADSET') current.adSets += 1;
      else if (assignment.metaObjectType === 'AD') current.ads += 1;
      countsByUser.set(assignment.userId, current);
    }

    // Build response: user details + counts
    const data = users.map((user) => {
      const counts = countsByUser.get(user.id) ?? { campaigns: 0, adSets: 0, ads: 0 };
      const { campaigns, adSets, ads } = counts;

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
