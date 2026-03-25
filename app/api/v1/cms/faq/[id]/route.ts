export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        question: body.question,
        questionBn: body.questionBn?.trim() || null,
        answer: body.answer,
        answerBn: body.answerBn?.trim() || null,
        order: body.order,
      },
    });
    return NextResponse.json(faq);
  } catch (error) {
    console.error('PUT /api/v1/cms/faq/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.fAQ.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/v1/cms/faq/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
