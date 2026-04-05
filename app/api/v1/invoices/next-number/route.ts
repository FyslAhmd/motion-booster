import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth/validate-request';
import { allocateNextInvoiceNumber } from '@/lib/server/invoices';

export async function POST(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const invoiceNo = await allocateNextInvoiceNumber();
    return NextResponse.json({ success: true, invoiceNo });
  } catch (err: any) {
    if (err?.code === 'P2021') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invoice counter table is not migrated yet. Run: npx prisma migrate dev',
        },
        { status: 503 },
      );
    }

    console.error('[invoices/next-number POST]', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to allocate invoice number' },
      { status: 500 },
    );
  }
}
