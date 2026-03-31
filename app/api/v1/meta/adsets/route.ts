import { NextResponse } from 'next/server';
import { fetchAdSetsPage, fetchAdSetsByCampaign } from '@/lib/meta/client';
import { deriveAdSetStatus } from '@/lib/meta/derive-status';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'default'; // 'default' | 'by_campaign'
    const accountId = searchParams.get('account_id') || undefined;
    const search = searchParams.get('search') || undefined;
    const after = searchParams.get('after') || undefined;
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));
    const campaignId = searchParams.get('campaign_id') || undefined;
    const status = searchParams.get('status') || undefined;

    // Fast path: query directly from the campaign node — no account_id needed.
    // This is the canonical approach and always returns the correct adsets.
    if (mode === 'by_campaign' && campaignId) {
      const result = await fetchAdSetsByCampaign(campaignId, limit);
      const data = (result.data || []).map((a: any) => ({
        ...a,
        derived_status: deriveAdSetStatus(a),
      }));
      return NextResponse.json({ success: true, data });
    }

    const result = await fetchAdSetsPage({
      accountId,
      limit,
      after,
      search,
      campaignId,
      status,
    });

    // Sanitize paging — strip raw next/previous URLs that contain access tokens
    const paging = result.paging
      ? {
          cursors: result.paging.cursors || null,
          hasNext: !!result.paging.next,
          hasPrevious: !!result.paging.previous,
        }
      : null;

    const data = (result.data || []).map((a: any) => ({
      ...a,
      derived_status: deriveAdSetStatus(a),
    }));

    return NextResponse.json({
      success: true,
      data,
      paging,
      totalCount: result.summary?.total_count ?? null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
