import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Routes under /dashboard that normal users (non-admin) can access.
 * Everything else under /dashboard requires ADMIN role.
 */
const USER_ALLOWED_PATHS = [
  '/dashboard/chat',
  '/dashboard/meta',
  '/dashboard/profile',
];

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /dashboard routes (skip API routes — they guard themselves)
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Get token from cookie or Authorization header
  const token =
    req.cookies.get('accessToken')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '') ||
    // Also check session storage relay via custom header (for SPA navigation)
    req.headers.get('x-access-token');

  // No token → redirect to login
  if (!token) {
    // Don't redirect API calls
    if (pathname.startsWith('/dashboard/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    const role = payload.role as string;

    // Admin can access everything
    if (role === 'ADMIN') {
      return NextResponse.next();
    }

    // Non-admin: check if route is allowed
    const isAllowed = USER_ALLOWED_PATHS.some(
      (route) => pathname === route || pathname.startsWith(route + '/')
    );

    if (isAllowed) {
      return NextResponse.next();
    }

    // Non-admin trying to access admin route → redirect to their default page
    return NextResponse.redirect(new URL('/dashboard/chat', req.url));
  } catch {
    // Invalid/expired token → redirect to login
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
