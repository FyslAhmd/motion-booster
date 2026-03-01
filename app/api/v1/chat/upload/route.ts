import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from '@/lib/auth/validate-request';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

// ─── Config ──────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const UPLOAD_DIR = join(process.cwd(), 'uploads', 'chat');

const ALLOWED_MIME_TYPES = new Set([
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Videos
  'video/mp4',
  'video/webm',
  'video/quicktime',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
  // Audio / Voice
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg',
  'audio/webm;codecs=opus',
]);

// Voice MIME types are exempt from the 10 MB limit
const VOICE_MIME_TYPES = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg',
  'audio/webm;codecs=opus',
]);

// ─── Helpers ─────────────────────────────────────────

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_.\-]/g, '_') // Replace unsafe chars
    .replace(/_{2,}/g, '_')             // Collapse multiple underscores
    .slice(0, 100);                     // Limit length
}

function generateUniqueId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${timestamp}-${random}`;
}

// ─── POST /api/v1/chat/upload ────────────────────────
// Handles file uploads for chat messages.
// Returns: { fileUrl, fileName, fileSize, mimeType }
export async function POST(req: NextRequest) {
  try {
    const user = await validateRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Normalize MIME type (browsers sometimes send with params)
    const mimeType = file.type.split(';')[0].trim();
    const fullMimeType = file.type;

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(mimeType) && !ALLOWED_MIME_TYPES.has(fullMimeType)) {
      return NextResponse.json(
        { error: `File type "${mimeType}" is not allowed` },
        { status: 400 }
      );
    }

    // Validate file size (voice messages are exempt)
    const isVoice = VOICE_MIME_TYPES.has(mimeType) || VOICE_MIME_TYPES.has(fullMimeType);
    if (!isVoice && file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: `File size exceeds 10 MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`,
        },
        { status: 413 }
      );
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const uniqueId = generateUniqueId();
    const originalName = sanitizeFileName(file.name || 'untitled');
    const storedName = `${uniqueId}-${originalName}`;
    const filePath = join(UPLOAD_DIR, storedName);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Build public URL
    const fileUrl = `/uploads/chat/${storedName}`;

    return NextResponse.json(
      {
        fileUrl,
        fileName: file.name || 'untitled',
        fileSize: file.size,
        mimeType: fullMimeType,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /chat/upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
