import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

/**
 * GET /api/v1/admin/meta-assignments/users/[userId]
 * Returns all Meta ad assignments for a specific user, grouped by type.
 * Also returns the user's basic info.
 * Admin can view any user. Regular users can only view their own.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const auth = await validateRequest(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // Non-admin users can only access their own assignments
    if (auth.role !== 'ADMIN' && auth.id !== userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        phone: true,
        username: true,
        email: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Fetch all assignments for this user
    const assignments = await prisma.metaAdAssignment.findMany({
      where: { userId },
      orderBy: { assignedAt: 'desc' },
    });

    // Group by type
    const campaignIds = assignments
      .filter((a) => a.metaObjectType === 'CAMPAIGN')
      .map((a) => ({ metaObjectId: a.metaObjectId, metaAccountId: a.metaAccountId }));
    const adSetIds = assignments
      .filter((a) => a.metaObjectType === 'ADSET')
      .map((a) => ({ metaObjectId: a.metaObjectId, metaAccountId: a.metaAccountId }));
    const adIds = assignments
      .filter((a) => a.metaObjectType === 'AD')
      .map((a) => ({ metaObjectId: a.metaObjectId, metaAccountId: a.metaAccountId }));

    return NextResponse.json({
      success: true,
      data: {
        user,
        campaigns: campaignIds,
        adSets: adSetIds,
        ads: adIds,
      },
    });
  } catch (err) {
    console.error('[meta-assignments/users/[userId] GET]', err);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user assignments' },
      { status: 500 },
    );
  }
}
