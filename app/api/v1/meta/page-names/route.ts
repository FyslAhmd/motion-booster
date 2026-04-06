import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth/validate-request';
import { metaFetch, type MetaPaginatedResponse } from '@/lib/meta/client';

type MetaPage = {
  id?: string;
  name?: string;
};

type MetaAd = {
  creative?: {
    id?: string;
    object_story_spec?: {
      page_id?: string;
      instagram_actor_id?: string;
    };
  };
};

type MetaCreative = {
  id?: string;
  object_story_spec?: {
    page_id?: string;
    instagram_actor_id?: string;
  };
};

const MAX_CAMPAIGNS = 50;
const MAX_BATCH_IDS = 50;
const MAX_AD_PAGES = 15;

function chunk<T>(items: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function uniq(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

async function fetchCampaignPageIds(campaignId: string) {
  const pageIds = new Set<string>();
  const creativeIds = new Set<string>();

  let after: string | undefined;
  for (let i = 0; i < MAX_AD_PAGES; i++) {
    const params: Record<string, string> = {
      fields: 'creative{id,object_story_spec{page_id,instagram_actor_id}}',
      limit: '100',
    };
    if (after) params.after = after;

    const res = await metaFetch<MetaPaginatedResponse<MetaAd>>(`/${campaignId}/ads`, params);
    const ads = Array.isArray(res.data) ? res.data : [];

    ads.forEach((ad) => {
      const pageId = ad?.creative?.object_story_spec?.page_id;
      if (pageId) pageIds.add(pageId);
      if (!pageId && ad?.creative?.id) creativeIds.add(ad.creative.id);
    });

    if (!res.paging?.next || !res.paging?.cursors?.after) break;
    after = res.paging.cursors.after;
  }

  // Fallback for creatives where object_story_spec was not expanded in the ad response.
  if (pageIds.size === 0 && creativeIds.size > 0) {
    for (const idsChunk of chunk(Array.from(creativeIds), MAX_BATCH_IDS)) {
      try {
        const batchRes = await metaFetch<Record<string, MetaCreative>>('/', {
          ids: idsChunk.join(','),
          fields: 'object_story_spec{page_id,instagram_actor_id}',
        });
        Object.values(batchRes || {}).forEach((creative) => {
          const pageId = creative?.object_story_spec?.page_id;
          if (pageId) pageIds.add(pageId);
        });
      } catch {
        const settled = await Promise.allSettled(
          idsChunk.map((id) => metaFetch<MetaCreative>(`/${id}`, { fields: 'object_story_spec{page_id,instagram_actor_id}' })),
        );
        settled.forEach((result) => {
          if (result.status !== 'fulfilled') return;
          const pageId = result.value?.object_story_spec?.page_id;
          if (pageId) pageIds.add(pageId);
        });
      }
    }
  }

  return Array.from(pageIds);
}

async function fetchPageNameMap(pageIds: string[]) {
  const ids = uniq(pageIds);
  const map: Record<string, string> = {};

  if (ids.length === 0) return map;

  for (const idsChunk of chunk(ids, MAX_BATCH_IDS)) {
    try {
      const batchRes = await metaFetch<Record<string, MetaPage>>('/', {
        ids: idsChunk.join(','),
        fields: 'name',
      });

      Object.entries(batchRes || {}).forEach(([id, value]) => {
        map[id] = value?.name || id;
      });
    } catch {
      const settled = await Promise.allSettled(
        idsChunk.map((id) => metaFetch<MetaPage>(`/${id}`, { fields: 'name' })),
      );

      settled.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const id = idsChunk[index];
          map[id] = result.value?.name || id;
        }
      });
    }
  }

  return map;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const idsParam = req.nextUrl.searchParams.get('ids') || '';
    const ids = Array.from(
      new Set(
        idsParam
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean),
      ),
    ).slice(0, MAX_CAMPAIGNS);

    if (ids.length === 0) {
      return NextResponse.json({ success: true, data: [], map: {} });
    }

    const campaignPageIdMap: Record<string, string[]> = {};
    const allPageIds = new Set<string>();

    for (const campaignId of ids) {
      try {
        const pageIds = await fetchCampaignPageIds(campaignId);
        campaignPageIdMap[campaignId] = pageIds;
        pageIds.forEach((pageId) => allPageIds.add(pageId));
      } catch (error) {
        console.warn('[meta/page-names GET] campaign page lookup failed:', campaignId, error);
        campaignPageIdMap[campaignId] = [];
      }
    }

    const pageNameMap = await fetchPageNameMap(Array.from(allPageIds));

    const data = ids.map((campaignId) => {
      const names = uniq((campaignPageIdMap[campaignId] || []).map((pageId) => pageNameMap[pageId] || pageId));
      return {
        campaignId,
        names,
        name: names.length > 0 ? names.join(', ') : 'N/A',
      };
    });

    const map = Object.fromEntries(data.map((item) => [item.campaignId, item.name]));

    return NextResponse.json({ success: true, data, map });
  } catch (err: unknown) {
    console.error('[meta/page-names GET]', err);
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch page names';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
