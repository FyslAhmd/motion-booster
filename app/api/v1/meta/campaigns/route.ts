import { NextResponse } from 'next/server';
import { fetchCampaigns } from '@/lib/meta/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const status = searchParams.get('status') || '';

    let data: any[] = await fetchCampaigns();

    // Filter by status
    if (status) {
      data = data.filter((c) => c.effective_status === status);
    }

    // Search by name
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((c) => c.name?.toLowerCase().includes(q));
    }

    // Date range filter (by created_time or start_time)
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      data = data.filter((c) => {
        const t = new Date(c.created_time || c.start_time || 0).getTime();
        return t >= from;
      });
    }
    if (dateTo) {
      const to = new Date(dateTo + 'T23:59:59.999Z').getTime();
      data = data.filter((c) => {
        const t = new Date(c.created_time || c.start_time || 0).getTime();
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
