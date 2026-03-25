import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const USER_ALLOWED_PATHS: { path: string; exact?: boolean }[] = [
  { path: '/dashboard', exact: true },
  { path: '/dashboard/chat' },
  { path: '/dashboard/meta' },
  { path: '/dashboard/profile' },
  { path: '/dashboard/user-campaigns' },
];

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard /dashboard routes (skip API routes — they guard themselves)
  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // Get access token from cookie or Authorization header
  const token =
    req.cookies.get('accessToken')?.value ||
    req.headers.get('authorization')?.replace('Bearer ', '');

  // No access token
  if (!token) {
    // If a refresh token cookie exists, let the page load so the client-side
    // AuthProvider can silently refresh the session.
    const hasRefreshToken = req.cookies.has('refreshToken');
    if (hasRefreshToken) {
      return NextResponse.next();
    }

    // No tokens at all → redirect to login
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
    const isAllowed = USER_ALLOWED_PATHS.some(({ path, exact }) =>
      exact ? pathname === path : pathname === path || pathname.startsWith(path + '/')
    );

    if (isAllowed) {
      return NextResponse.next();
    }

    // Non-admin trying to access admin route → redirect to their default page
    return NextResponse.redirect(new URL('/dashboard/chat', req.url));
  } catch {
    // Invalid/expired access token — if refresh token exists, let page load
    // so the client-side AuthProvider can refresh the session silently.
    const hasRefreshToken = req.cookies.has('refreshToken');
    if (hasRefreshToken) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
