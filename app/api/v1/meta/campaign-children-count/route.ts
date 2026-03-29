import { NextResponse } from 'next/server';
import { metaFetchPage } from '@/lib/meta/client';

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

    const [adSetsRes, adsRes] = await Promise.all([
      metaFetchPage(`/${campaignId}/adsets`, { fields: 'id', limit: '1', summary: 'true' }),
      metaFetchPage(`/${campaignId}/ads`, { fields: 'id', limit: '1', summary: 'true' }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        adSets: Number(adSetsRes?.summary?.total_count ?? 0),
        ads: Number(adsRes?.summary?.total_count ?? 0),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to fetch campaign child counts' },
      { status: 500 },
    );
  }
}

