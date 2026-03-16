import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { defaultCompanies } from '@/lib/admin/store';
import { isRecoverableDbError } from '@/lib/server/db-error';

export async function GET() {
  try {
    const companies = await prisma.company.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(companies);
  } catch (error) {
    console.error('[CMS companies GET]', error);

    if (isRecoverableDbError(error)) {
      return NextResponse.json(defaultCompanies);
    }

    return NextResponse.json({ error: 'Failed to load companies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, logoImage } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const count = await prisma.company.count();
    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        logoImage: logoImage || null,
        order: count,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('[CMS companies POST]', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}
