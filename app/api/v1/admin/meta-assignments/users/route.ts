import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';
import { metaFetchPage } from '@/lib/meta/client';

type UserCounts = { campaigns: number; adSets: number; ads: number };
type CampaignChildCounts = { adSets: number; ads: number };

async function fetchCampaignChildCounts(campaignId: string): Promise<CampaignChildCounts> {
  try {
    const [adSetsRes, adsRes] = await Promise.all([
      metaFetchPage(`/${campaignId}/adsets`, { fields: 'id', limit: '1', summary: 'true' }),
      metaFetchPage(`/${campaignId}/ads`, { fields: 'id', limit: '1', summary: 'true' }),
    ]);

    return {
      adSets: Number(adSetsRes?.summary?.total_count ?? 0),
      ads: Number(adsRes?.summary?.total_count ?? 0),
    };
  } catch (err) {
    console.error('[meta-assignments/users campaign-children]', campaignId, err);
    return { adSets: 0, ads: 0 };
  }
}

/**
 * GET /api/v1/admin/meta-assignments/users
 * Returns all unique users who have at least one Meta ad assignment,
 * along with hierarchy-aware counts.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const assignments = await prisma.metaAdAssignment.findMany({
      select: {
        userId: true,
        metaObjectType: true,
        metaObjectId: true,
      },
      distinct: ['userId', 'metaObjectType', 'metaObjectId'],
    });

    const userIds = [...new Set(assignments.map((a) => a.userId))];
    if (userIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

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

    const directCountsByUser = new Map<string, UserCounts>();
    const campaignIdsByUser = new Map<string, Set<string>>();

    for (const assignment of assignments) {
      const current = directCountsByUser.get(assignment.userId) ?? { campaigns: 0, adSets: 0, ads: 0 };

      if (assignment.metaObjectType === 'CAMPAIGN') {
        current.campaigns += 1;
        const set = campaignIdsByUser.get(assignment.userId) ?? new Set<string>();
        set.add(assignment.metaObjectId);
        campaignIdsByUser.set(assignment.userId, set);
      } else if (assignment.metaObjectType === 'ADSET') {
        current.adSets += 1;
      } else if (assignment.metaObjectType === 'AD') {
        current.ads += 1;
      }

      directCountsByUser.set(assignment.userId, current);
    }

    const uniqueCampaignIds = Array.from(new Set(
      Array.from(campaignIdsByUser.values()).flatMap((set) => Array.from(set)),
    ));

    const campaignChildCounts = new Map<string, CampaignChildCounts>();
    await Promise.all(
      uniqueCampaignIds.map(async (campaignId) => {
        campaignChildCounts.set(campaignId, await fetchCampaignChildCounts(campaignId));
      }),
    );

    const data = users.map((user) => {
      const direct = directCountsByUser.get(user.id) ?? { campaigns: 0, adSets: 0, ads: 0 };
      const campaignIds = Array.from(campaignIdsByUser.get(user.id) ?? []);

      const derived = campaignIds.reduce(
        (acc, campaignId) => {
          const child = campaignChildCounts.get(campaignId) ?? { adSets: 0, ads: 0 };
          return {
            adSets: acc.adSets + child.adSets,
            ads: acc.ads + child.ads,
          };
        },
        { adSets: 0, ads: 0 },
      );

      const campaigns = direct.campaigns;
      const adSets = Math.max(direct.adSets, derived.adSets);
      const ads = Math.max(direct.ads, derived.ads);

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
