import { NextResponse } from 'next/server';
import {
  fetchCampaignsPage,
  fetchCampaignNames,
} from '@/lib/meta/client';
import { deriveDeliveryStatus } from '@/lib/meta/derive-status';
import { cachedFetch } from '@/lib/meta/cache';

/** Prefix that marks a cursor as an in-memory offset (not a Meta cursor) */
const D_OFFSET_PREFIX = '__d:' as const;

// Derived statuses that are sub-types of Meta's ACTIVE effective_status
const DERIVED_FROM_ACTIVE = new Set([
  'ACTIVE',
  'COMPLETED',
  'RECENTLY_COMPLETED',
  'SCHEDULED',
  'NOT_DELIVERING',
]);

// Map filter value → Meta API effective_status
const FILTER_TO_API: Record<string, string> = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'ACTIVE',
  RECENTLY_COMPLETED: 'ACTIVE',
  SCHEDULED: 'ACTIVE',
  NOT_DELIVERING: 'ACTIVE',
  PAUSED: 'PAUSED',
  DELETED: 'DELETED',
  ARCHIVED: 'ARCHIVED',
  IN_PROCESS: 'IN_PROCESS',
  WITH_ISSUES: 'WITH_ISSUES',
};

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

    // ── Derived status filter (needs server-side post-filtering) ──────────
    // Meta's ACTIVE effective_status is a superset: it contains campaigns that
    // are truly Active, Completed, Recently Completed, Scheduled, Not Delivering.
    // Strategy:
    //   1. Paginate through ALL of Meta's ACTIVE campaigns (100/batch, max 15×).
    //   2. Apply deriveDeliveryStatus() and keep only items matching `status`.
    //   3. Cache the full filtered list (2 min TTL) keyed by account+status+search.
    //   4. Serve pages using offset-based pagination encoded in the cursor
    //      as "__d:<offset>" so the frontend cursor stack keeps working.
    if (status && DERIVED_FROM_ACTIVE.has(status)) {
      // Decode offset from cursor (undefined / non-prefixed cursor → page 1)
      let offset = 0;
      if (after?.startsWith(D_OFFSET_PREFIX)) {
        offset = parseInt(after.slice(D_OFFSET_PREFIX.length), 10) || 0;
      }

      // Build and cache the full filtered list for this account/status/search
      const cacheKey = `meta:filtered-campaigns:${accountId ?? 'all'}:${status}:${search ?? ''}`;
      const allMatched: any[] = await cachedFetch(cacheKey, async () => {
        const results: any[] = [];
        let pageAfter: string | undefined;

        for (let i = 0; i < 15; i++) {       // max 1 500 campaigns
          const batch = await fetchCampaignsPage({
            accountId,
            limit: 100,
            after: pageAfter,
            search,
            status: 'ACTIVE',             // all derived sub-statuses live here
          });

          const withDerived = (batch.data || []).map((c: any) => ({
            ...c,
            derived_status: deriveDeliveryStatus(c),
          }));
          results.push(
            ...withDerived.filter((c: any) => c.derived_status.key === status),
          );

          if (!batch.paging?.next) break;
          pageAfter = batch.paging?.cursors?.after;
          if (!pageAfter) break;
        }

        return results;
      });

      // Serve the requested page from the cached list
      const pageData   = allMatched.slice(offset, offset + limit);
      const nextOffset = offset + limit;
      const hasNext    = nextOffset < allMatched.length;

      return NextResponse.json({
        success: true,
        data: pageData,
        paging: {
          cursors: {
            before: offset > 0
              ? `${D_OFFSET_PREFIX}${Math.max(0, offset - limit)}`
              : null,
            after: hasNext ? `${D_OFFSET_PREFIX}${nextOffset}` : null,
          },
          hasNext,
          hasPrevious: offset > 0,
        },
        totalCount: allMatched.length,
      });
    }

    // ── Standard filter (direct Meta API status or no filter) ─────────────
    const effectiveStatus = status ? FILTER_TO_API[status] || status : undefined;

    const result = await fetchCampaignsPage({
      accountId,
      limit,
      after,
      search,
      status: effectiveStatus,
    });

    // Attach derived_status to each campaign
    const data = (result.data || []).map((c: any) => ({
      ...c,
      derived_status: deriveDeliveryStatus(c),
    }));

    const paging = result.paging
      ? {
          cursors: result.paging.cursors || null,
          hasNext: !!result.paging.next,
          hasPrevious: !!result.paging.previous,
        }
      : null;

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
