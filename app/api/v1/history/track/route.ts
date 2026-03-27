import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth/validate-request';
import { getClientIp, logActivity } from '@/lib/server/activity-history';

export async function POST(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      path?: string;
      action?: string;
      metadata?: Record<string, unknown>;
    };

    const path = typeof body.path === 'string' ? body.path.slice(0, 2048) : req.nextUrl.pathname;

    await logActivity({
      userId: auth.id,
      eventType: 'PAGE_VISIT',
      action: typeof body.action === 'string' ? body.action : 'PAGE VISIT',
      path,
      method: 'GET',
      ipAddress: getClientIp(req),
      userAgent: req.headers.get('user-agent'),
      metadata: body.metadata ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[history/track]', error);
    return NextResponse.json({ success: false, error: 'Failed to track history' }, { status: 500 });
  }
}
