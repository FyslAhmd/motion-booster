import { NextResponse } from 'next/server';
import { metaFetchPage } from '@/lib/meta/client';
import { cachedFetch } from '@/lib/meta/cache';

const CACHE_TTL_CHILD_COUNTS = 15 * 60 * 1000; // 15 minutes

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaign_id');

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'campaign_id is required' },
        { status: 400 },
      );
    }

    const data = await cachedFetch(
      `meta:campaign-child-counts:${campaignId}`,
      async () => {
        try {
          const [adSetsRes, adsRes] = await Promise.all([
            metaFetchPage(`/${campaignId}/adsets`, { fields: 'id', limit: '1', summary: 'true' }),
            metaFetchPage(`/${campaignId}/ads`, { fields: 'id', limit: '1', summary: 'true' }),
          ]);

          return {
            adSets: Number(adSetsRes?.summary?.total_count ?? 0),
            ads: Number(adsRes?.summary?.total_count ?? 0),
          };
        } catch (err: any) {
          console.warn(`[campaign-children-count] Failed for ${campaignId}: ${err?.message || err}`);
          return { adSets: 0, ads: 0 };
        }
      },
      CACHE_TTL_CHILD_COUNTS,
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to fetch campaign child counts' },
      { status: 500 },
    );
  }
}

