import { NextResponse } from 'next/server';
import { fetchAdAccount, fetchAdAccounts } from '@/lib/meta/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const discover = searchParams.get('discover'); // ?discover=1 → lists all accounts
    const accountId = searchParams.get('account_id') || undefined;

    if (discover) {
      const accounts = await fetchAdAccounts();
      return NextResponse.json({ success: true, data: accounts });
    }

    const account = await fetchAdAccount(accountId);
    return NextResponse.json({ success: true, data: account });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
