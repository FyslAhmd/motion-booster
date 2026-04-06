export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(member);
  } catch (error) {
    console.error('GET /api/v1/cms/team/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch team member' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const rawOrder = Number(body.order);
    const normalizedOrder = Number.isFinite(rawOrder) && rawOrder >= 0
      ? Math.floor(rawOrder)
      : undefined;

    const member = await prisma.$transaction(async (tx) => {
      if (body.featured === true) {
        await tx.teamMember.updateMany({
          where: { id: { not: id } },
          data: { featured: false },
        });
      }

      return tx.teamMember.update({
        where: { id },
        data: {
          name: body.name,
          role: body.role,
          roleBn: body.roleBn?.trim() || null,
          experience: body.experience,
          experienceBn: body.experienceBn?.trim() || null,
          projects: body.projects,
          projectsBn: body.projectsBn?.trim() || null,
          department: body.department,
          departmentBn: body.departmentBn?.trim() || null,
          featured: body.featured,
          avatar: body.avatar,
          avatarColor: body.avatarColor,
          avatarImage: body.avatarImage ?? null,
          workExperience: body.workExperience ?? [],
          workExperienceBn: body.workExperienceBn ?? [],
          specializedArea: body.specializedArea ?? [],
          specializedAreaBn: body.specializedAreaBn ?? [],
          education: body.education ?? [],
          educationBn: body.educationBn ?? [],
          workPlaces: body.workPlaces ?? [],
          workPlaceLogos: body.workPlaceLogos ?? [],
          workPlacesBn: body.workPlacesBn ?? [],
          order: normalizedOrder,
        },
      });
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('PUT /api/v1/cms/team/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update team member' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.teamMember.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/v1/cms/team/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
  }
}
