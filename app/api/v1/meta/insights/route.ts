import { NextResponse } from 'next/server';
import {
  fetchAccountInsights,
  fetchCampaignInsights,
  fetchSingleCampaignInsights,
  fetchDailySpend,
  fetchDemographics,
  type TimeRange,
} from '@/lib/meta/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'account'; // account | campaigns | daily | demographics
    const datePreset = searchParams.get('date_preset') || 'last_30d';
    const accountId = searchParams.get('account_id') || undefined;
    const timeIncrement = searchParams.get('time_increment') || undefined;

    // Custom date range: since + until override date_preset
    const since = searchParams.get('since');
    const until = searchParams.get('until');
    const timeRange: TimeRange | undefined =
      since && until ? { since, until } : undefined;

    switch (type) {
      case 'account': {
        const data = await fetchAccountInsights(datePreset, timeIncrement, accountId, timeRange);
        return NextResponse.json({ success: true, data });
      }
      case 'campaigns': {
        const data = await fetchCampaignInsights(datePreset, timeIncrement, accountId, timeRange);
        return NextResponse.json({ success: true, data });
      }
      case 'single_campaign': {
        const campaignId = searchParams.get('campaign_id');
        if (!campaignId) {
          return NextResponse.json({ success: false, error: 'campaign_id is required' }, { status: 400 });
        }
        const data = await fetchSingleCampaignInsights(campaignId, datePreset, timeRange);
        return NextResponse.json({ success: true, data });
      }
      case 'daily': {
        const data = await fetchDailySpend(datePreset, accountId, timeRange);
        return NextResponse.json({ success: true, data });
      }
      case 'demographics': {
        const data = await fetchDemographics(datePreset, accountId, timeRange);
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
