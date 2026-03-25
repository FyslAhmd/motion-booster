export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

const DEFAULT_SERVICES = [
  { title: 'Easy Task Creation', description: 'Add new tasks quickly with a simple and user-friendly interface. Organize your workload without the hassle.', iconColor: 'bg-purple-400', iconType: 'document', order: 0 },
  { title: 'Due Date & Reminders', description: 'Set due dates and reminders to ensure you meet your deadlines. Get notified via email or in-app alerts.', iconColor: 'bg-green-400', iconType: 'calendar', order: 1 },
  { title: 'Customizable Lists', description: 'Customize task lists to match your unique workflow. Group tasks by project, priority, or deadline to stay on top of everything.', iconColor: 'bg-cyan-400', iconType: 'list', order: 2 },
  { title: 'Progress Tracking', description: 'Visualize your progress with intuitive dashboards and progress bars. Keep track of completed and pending tasks effortlessly.', iconColor: 'bg-cyan-400', iconType: 'chart', order: 3 },
  { title: 'Cross Platform Sync', description: 'Access your tasks from any device. Our application syncs across web, mobile, and desktop to keep you connected.', iconColor: 'bg-green-400', iconType: 'sync', order: 4 },
];

export async function GET() {
  try {
    let services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
    if (services.length === 0) {
      await prisma.service.createMany({ data: DEFAULT_SERVICES });
      services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
    }
    return NextResponse.json(services);
  } catch (error) {
    console.error('[CMS services GET]', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await prisma.service.count();
    const service = await prisma.service.create({
      data: {
        title: body.title,
        description: body.description,
        iconColor: body.iconColor ?? 'bg-red-400',
        iconType: body.iconType ?? 'document',
        order: count,
      },
    });
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('[CMS services POST]', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
