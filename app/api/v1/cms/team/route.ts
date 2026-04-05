export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' },
      ],
    });
    return NextResponse.json(members);
  } catch (error) {
    console.error('GET /api/v1/cms/team error:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawOrder = Number(body.order);
    const member = await prisma.$transaction(async (tx) => {
      const count = await tx.teamMember.count();
      const normalizedOrder = Number.isFinite(rawOrder) && rawOrder >= 0
        ? Math.min(Math.floor(rawOrder), count)
        : count;

      if (body.featured === true) {
        await tx.teamMember.updateMany({
          data: { featured: false },
        });
      }

      return tx.teamMember.create({
        data: {
          name: body.name,
          role: body.role,
          roleBn: body.roleBn?.trim() || null,
          experience: body.experience ?? '',
          experienceBn: body.experienceBn?.trim() || null,
          projects: body.projects ?? '',
          projectsBn: body.projectsBn?.trim() || null,
          department: body.department ?? '',
          departmentBn: body.departmentBn?.trim() || null,
          featured: body.featured ?? false,
          avatar: body.avatar ?? '',
          avatarColor: body.avatarColor ?? 'bg-blue-500',
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

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/cms/team error:', error);
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}
