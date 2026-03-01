import { NextResponse } from 'next/server';
import {
  fetchAccountInsights,
  fetchCampaignInsights,
  fetchDailySpend,
  fetchDemographics,
} from '@/lib/meta/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'account'; // account | campaigns | daily | demographics
    const datePreset = searchParams.get('date_preset') || 'last_30d';

    switch (type) {
      case 'account': {
        const data = await fetchAccountInsights(datePreset);
        return NextResponse.json({ success: true, data });
      }
      case 'campaigns': {
        const data = await fetchCampaignInsights(datePreset);
        return NextResponse.json({ success: true, data });
      }
      case 'daily': {
        const data = await fetchDailySpend(datePreset);
        return NextResponse.json({ success: true, data });
      }
      case 'demographics': {
        const data = await fetchDemographics(datePreset);
        return NextResponse.json({ success: true, data });
      }
      default:
        return NextResponse.json(
          { success: false, error: `Unknown insight type: ${type}` },
          { status: 400 },
        );
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
