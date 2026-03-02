import { NextResponse } from 'next/server';
import { fetchAdSetsPage } from '@/lib/meta/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('account_id') || undefined;
    const search = searchParams.get('search') || undefined;
    const after = searchParams.get('after') || undefined;
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));
    const campaignId = searchParams.get('campaign_id') || undefined;

    const result = await fetchAdSetsPage({
      accountId,
      limit,
      after,
      search,
      campaignId,
    });

    return NextResponse.json({
      success: true,
      data: result.data || [],
      paging: result.paging || null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
