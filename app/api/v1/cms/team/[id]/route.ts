import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        name: body.name,
        role: body.role,
        experience: body.experience,
        projects: body.projects,
        department: body.department,
        featured: body.featured,
        avatar: body.avatar,
        avatarColor: body.avatarColor,
        avatarImage: body.avatarImage ?? null,
        workExperience: body.workExperience ?? [],
        specializedArea: body.specializedArea ?? [],
        education: body.education ?? [],
        workPlaces: body.workPlaces ?? [],
        order: body.order,
      },
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
