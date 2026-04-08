import { NextResponse } from 'next/server';
import {
  getActiveCountsAcrossAccounts,
  getActiveCountsForAccount,
} from '@/lib/meta/active-counts';

/**
 * GET /api/v1/meta/active-counts?account_id=act_xxx
 * Returns truly-active counts for campaigns, ad sets, and ads.
 *
 * Campaign count: paginates through all effective_status=ACTIVE campaigns
 * in batches of 100, applies deriveDeliveryStatus to each, counts truly-ACTIVE.
 * Ad set / ad counts: paginates effective_status=ACTIVE rows and applies derived
 * status checks, while also requiring parent campaign to be truly ACTIVE when
 * campaign_id is available. This avoids inflated counts vs Ads Manager.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('account_id');
    const debug = searchParams.get('debug') === '1';
    const verbose = searchParams.get('verbose') === '1' || debug;

    // Single-account mode
    if (accountId) {
      const result = await getActiveCountsForAccount(accountId, {
        source: '/api/v1/meta/active-counts',
        verbose,
        scope: 'full',
      });
      return NextResponse.json({
        success: true,
        data: {
          ...result.counts,
          ...(debug ? { debug: result } : {}),
        },
      });
    }

    const summary = await getActiveCountsAcrossAccounts({
      source: '/api/v1/meta/active-counts',
      verbose,
      scope: 'full',
    });

    return NextResponse.json({
      success: true,
      data: {
        ...summary.totals,
        ...(debug
          ? {
              accountsScanned: summary.accountIds.length,
              accountsDiscovered: summary.discoveredAccounts,
              perAccount: summary.perAccount,
              failures: summary.failures,
              env: summary.env,
              durationMs: summary.durationMs,
            }
          : {}),
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
