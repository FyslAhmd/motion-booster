import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { validateRequest } from '@/lib/auth/validate-request';
import cloudinary from '@/lib/cloudinary';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * POST /api/v1/upload/avatar
 * Uploads a profile picture to Cloudinary and stores the resulting URL in DB.
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

    // Upload to Cloudinary via base64 data URI — no disk I/O, no stream timeout
    const buffer = Buffer.from(await file.arrayBuffer());
    const b64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'motion-booster/avatars',
      public_id: authUser.id,        // one file per user, re-uploads overwrite
      overwrite: true,
      resource_type: 'image',
      transformation: [
        { width: 256, height: 256, crop: 'fill', gravity: 'face' },
        { fetch_format: 'auto', quality: 'auto' },
      ],
    });

    const avatarUrl = result.secure_url;

    await prisma.user.update({
      where: { id: authUser.id },
      data: { avatarUrl },
    });

    return NextResponse.json({ success: true, data: { avatarUrl } });
  } catch (err: any) {
    console.error('[upload/avatar]', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

