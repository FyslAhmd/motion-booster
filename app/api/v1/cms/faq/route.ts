export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { defaultFAQs } from '@/lib/admin/store';
import { isRecoverableDbError } from '@/lib/server/db-error';

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error('GET /api/v1/cms/faq error:', error);

    if (isRecoverableDbError(error)) {
      return NextResponse.json(defaultFAQs);
    }

    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await prisma.fAQ.count();
    const faq = await prisma.fAQ.create({
      data: {
        question: body.question,
        questionBn: body.questionBn?.trim() || null,
        answer: body.answer,
        answerBn: body.answerBn?.trim() || null,
        order: count,
      },
    });
    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/cms/faq error:', error);
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
  }
}
