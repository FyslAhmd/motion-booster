import { NextRequest, NextResponse } from 'next/server';
import { validateRequest } from './validate-request';

/**
 * Server-side guard for admin-only API routes.
 * Returns the authenticated user if they have ADMIN role,
 * otherwise returns a 403 JSON response.
 *
 * Usage in route handlers:
 *   const result = await requireAdmin(req);
 *   if (result instanceof NextResponse) return result;
 *   const user = result; // AuthenticatedUser
 */
export async function requireAdmin(req: NextRequest) {
  const user = await validateRequest(req);

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 },
    );
  }

  if (user.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Admin access required' },
      { status: 403 },
    );
  }

  return user;
}
