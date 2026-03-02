import { NextResponse } from 'next/server';
import { fetchAds } from '@/lib/meta/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const adsetId = searchParams.get('adset_id') || '';

    let data: any[] = await fetchAds();

    // Filter by ad set
    if (adsetId) {
      data = data.filter((a) => a.adset_id === adsetId);
    }

    if (search) {
      const q = search.toLowerCase();
      data = data.filter((a) => a.name?.toLowerCase().includes(q));
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      data = data.filter((a) => {
        const t = new Date(a.created_time || 0).getTime();
        return t >= from;
      });
    }
    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59.999Z').getTime();
      data = data.filter((a) => {
        const t = new Date(a.created_time || 0).getTime();
        return t <= to;
      });
    }

    const total = data.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginated = data.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      pagination: { page, limit, total, totalPages },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
