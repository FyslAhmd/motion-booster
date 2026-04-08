import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';
import { mkdir, readdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const AVATAR_UPLOAD_DIR = join(process.cwd(), 'uploads', 'avatars');

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

/**
 * POST /api/v1/upload/avatar
 * Uploads a profile picture to local VPS storage and stores the URL in DB.
 * Body: multipart/form-data with field "file"
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await validateRequest(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid form data' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    if (!file || typeof file === 'string') {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    if (!ALLOWED_MIME.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Only JPEG, PNG, WebP and GIF images are allowed' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File size must not exceed 5 MB' }, { status: 400 });
    }

    await mkdir(AVATAR_UPLOAD_DIR, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = EXT_BY_MIME[file.type] || '.jpg';
    const storedName = `${authUser.id}-${Date.now()}${fileExt}`;
    const filePath = join(AVATAR_UPLOAD_DIR, storedName);

    await writeFile(filePath, buffer);

    const avatarUrl = `/uploads/avatars/${storedName}`;

    await prisma.user.update({
      where: { id: authUser.id },
      data: { avatarUrl },
    });

    // Remove older local avatars for this user to keep disk usage under control.
    const userPrefix = `${authUser.id}-`;
    try {
      const files = await readdir(AVATAR_UPLOAD_DIR);
      const staleFiles = files.filter((name) => name.startsWith(userPrefix) && name !== storedName);
      await Promise.all(staleFiles.map((name) => unlink(join(AVATAR_UPLOAD_DIR, name)).catch(() => undefined)));
    } catch {
      // Non-fatal cleanup best-effort.
    }

    return NextResponse.json({ success: true, data: { avatarUrl } });
  } catch (err: unknown) {
    console.error('[upload/avatar]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

