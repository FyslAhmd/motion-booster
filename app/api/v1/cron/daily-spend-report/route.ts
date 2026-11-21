import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth/validate-request';
import { processAllDailySpendReports } from '@/lib/server/daily-spend';

function isAuthorizedCronRequest(req: NextRequest, authRole?: string): boolean {
  if (authRole === 'ADMIN') return true;

  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'motion-booster-cron-secret-key';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token === cronSecret) return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!isAuthorizedCronRequest(req, auth?.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { searchParams } = new URL(req.url);
    const dryRun = body.dryRun === true || searchParams.get('dryRun') === 'true' || searchParams.get('dryRun') === '1';
    const force = body.force === true || searchParams.get('force') === 'true' || searchParams.get('force') === '1';
    const specificUserId = (body.userId as string) || searchParams.get('userId') || undefined;
    const targetDateStr = (body.date as string) || searchParams.get('date') || undefined;

    const summary = await processAllDailySpendReports({
      dryRun,
      force,
      specificUserId,
      targetDateStr,
    });

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (err: any) {
    console.error('[cron/daily-spend-report POST]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process daily spend reports' },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
