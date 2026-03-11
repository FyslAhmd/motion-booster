import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({ orderBy: { order: 'asc' } });
    return NextResponse.json(members);
  } catch (error) {
    console.error('GET /api/v1/cms/team error:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await prisma.teamMember.count();
    const member = await prisma.teamMember.create({
      data: {
        name: body.name,
        role: body.role,
        experience: body.experience ?? '',
        projects: body.projects ?? '',
        department: body.department ?? '',
        featured: body.featured ?? false,
        avatar: body.avatar ?? '',
        avatarColor: body.avatarColor ?? 'bg-blue-500',
        avatarImage: body.avatarImage ?? null,
        workExperience: body.workExperience ?? [],
        specializedArea: body.specializedArea ?? [],
        education: body.education ?? [],
        workPlaces: body.workPlaces ?? [],
        order: count,
      },
    });
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('POST /api/v1/cms/team error:', error);
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}
