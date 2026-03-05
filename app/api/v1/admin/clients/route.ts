import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';

// GET /api/v1/admin/clients — list all clients (USER role)
export async function GET(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const clients = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        phone: true,
        status: true,
        adsAccess: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: clients });
  } catch (err) {
    console.error('[admin clients GET]', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch clients' }, { status: 500 });
  }
}

// PATCH /api/v1/admin/clients — update a client's status or adsAccess
export async function PATCH(req: NextRequest) {
  try {
    const auth = await validateRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, adsAccess } = body as {
      id: string;
      status?: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
      adsAccess?: boolean;
    };

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing id' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(adsAccess !== undefined && { adsAccess }),
      },
      select: {
        id: true,
        status: true,
        adsAccess: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('[admin clients PATCH]', err);
    return NextResponse.json({ success: false, error: 'Failed to update client' }, { status: 500 });
  }
}
