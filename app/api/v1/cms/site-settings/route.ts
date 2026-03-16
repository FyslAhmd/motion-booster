import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isRecoverableDbError } from '@/lib/server/db-error';

const DEFAULT_SETTINGS = {
  welcomeModalImage: '',
  welcomeModalTitle: 'Welcome to Motion Booster! 👋',
  welcomeModalBody: 'We help businesses grow with creative branding, motion graphics, web development & digital marketing.',
  welcomeModalExploreLink: '/service',
};

export async function GET() {
  try {
    let record = await prisma.siteSettings.findUnique({ where: { id: 'default' } });

    if (!record) {
      record = await prisma.siteSettings.create({
        data: { id: 'default', ...DEFAULT_SETTINGS },
      });
    }

    return NextResponse.json(record, {
      headers: {
        // Small browser cache to avoid repeated round-trips on fast reload/navigation.
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('[CMS site-settings GET]', error);

    if (isRecoverableDbError(error)) {
      return NextResponse.json(DEFAULT_SETTINGS, {
        headers: {
          'Cache-Control': 'public, max-age=60',
        },
      });
    }

    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { welcomeModalImage, welcomeModalTitle, welcomeModalBody, welcomeModalExploreLink } = body;

    const record = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        ...(welcomeModalImage !== undefined && { welcomeModalImage: welcomeModalImage || null }),
        ...(welcomeModalTitle !== undefined && { welcomeModalTitle }),
        ...(welcomeModalBody !== undefined && { welcomeModalBody }),
        ...(welcomeModalExploreLink !== undefined && { welcomeModalExploreLink }),
      },
      create: {
        id: 'default',
        welcomeModalImage: welcomeModalImage || null,
        welcomeModalTitle: welcomeModalTitle || DEFAULT_SETTINGS.welcomeModalTitle,
        welcomeModalBody: welcomeModalBody || DEFAULT_SETTINGS.welcomeModalBody,
        welcomeModalExploreLink: welcomeModalExploreLink || DEFAULT_SETTINGS.welcomeModalExploreLink,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error('[CMS site-settings PATCH]', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
