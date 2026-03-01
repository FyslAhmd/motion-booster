import { NextResponse } from 'next/server';
import { fetchAds } from '@/lib/meta/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adsetId = searchParams.get('adset_id') || undefined;

    const ads = await fetchAds(adsetId);
    return NextResponse.json({ success: true, data: ads });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
