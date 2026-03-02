import { NextResponse } from 'next/server';
import { fetchCampaignsPage, fetchCampaignNames } from '@/lib/meta/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('account_id') || undefined;
    const search = searchParams.get('search') || undefined;
    const after = searchParams.get('after') || undefined;
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10', 10)));
    const status = searchParams.get('status') || undefined;

    // Special endpoint: return just names for dropdowns
    if (searchParams.get('names_only') === '1') {
      const names = await fetchCampaignNames(accountId);
      return NextResponse.json({
        success: true,
        data: names.map((c: any) => ({ id: c.id, name: c.name })),
      });
    }

    const result = await fetchCampaignsPage({
      accountId,
      limit,
      after,
      search,
      status,
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
