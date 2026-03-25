import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { comparePassword, DUMMY_HASH } from '@/lib/auth/password';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '@/lib/auth/tokens';
import { loginSchema, formatZodErrors } from '@/lib/validators/auth';
import { AppError, formatErrorResponse } from '@/lib/errors/AppError';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    // 1. Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError('VAL_002', {
        message: 'Invalid JSON in request body',
      });
    }

    // 2. Validate input with Zod
    let validatedData;
    try {
      validatedData = loginSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError('VAL_001', {
          details: { fields: formatZodErrors(error) },
        });
      }
      throw error;
    }

    const { phone, password } = validatedData;

    // 3. Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        emailVerified: true,
        passwordHash: true,
        avatarUrl: true,
      },
    });

    // 4. Timing-safe comparison — always run bcrypt even if user doesn't exist
    //    This prevents attackers from determining if a phone number is registered
    //    by measuring response time differences.
    const hashToCompare = user?.passwordHash || DUMMY_HASH;
    const isPasswordValid = await comparePassword(password, hashToCompare);

    if (!user || !isPasswordValid) {
      throw new AppError('AUTH_001');
    }

    // 5. Check email verification
    if (!user.emailVerified) {
      throw new AppError('AUTH_010');
    }

    // 6. Check account status
    if (user.status === 'SUSPENDED' || user.status === 'BANNED') {
      throw new AppError('AUTH_003');
    }

    // 7. Generate token pair
    const familyId = crypto.randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(user.id, user.role),
      generateRefreshToken(user.id, familyId),
    ]);

    // 8. Store refresh token hash in DB (never store raw tokens)
    const refreshTokenHash = await hashToken(refreshToken);
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: ip,
        userAgent,
      },
    });

    // 9. Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      },
    });

    // 10. Build response with HttpOnly cookie for refresh token
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            avatarUrl: user.avatarUrl,
          },
          accessToken,
        },
        requestId,
      },
      { status: 200 }
    );

    // 11. Set refresh token as HttpOnly Secure cookie
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    // 12. Set access token cookie for middleware auth
    response.cookies.set('accessToken', accessToken, {
      httpOnly: false, // readable by middleware & JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 15 * 60, // 15 minutes (matches JWT expiry)
    });

    return response;
  } catch (error) {
    const { status, body } = formatErrorResponse(error, requestId);
    return NextResponse.json(body, { status });
  }
}
