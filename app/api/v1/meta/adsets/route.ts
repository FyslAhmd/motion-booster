import { NextResponse } from 'next/server';
import { fetchAdSets } from '@/lib/meta/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaign_id') || undefined;

    const adsets = await fetchAdSets(campaignId);
    return NextResponse.json({ success: true, data: adsets });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
