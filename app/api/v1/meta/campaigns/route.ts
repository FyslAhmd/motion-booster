import { NextResponse } from 'next/server';
import { fetchCampaigns } from '@/lib/meta/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;

    const campaigns = await fetchCampaigns(status);
    return NextResponse.json({ success: true, data: campaigns });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
