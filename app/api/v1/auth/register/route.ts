import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/password';
import { registerSchema, formatZodErrors } from '@/lib/validators/auth';
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
      validatedData = registerSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError('VAL_001', {
          details: { fields: formatZodErrors(error) },
        });
      }
      throw error;
    }

    const { username, fullName, email, phone, password } = validatedData;

    // 3. Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingEmail) {
      throw new AppError('AUTH_007');
    }

    // 4. Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUsername) {
      throw new AppError('AUTH_008');
    }

    // 5. Hash password (bcrypt, 12 salt rounds)
    const passwordHash = await hashPassword(password);

    // 6. Create user with default role USER
    const user = await prisma.user.create({
      data: {
        username,
        fullName,
        email,
        phone,
        passwordHash,
        role: 'USER',
        status: 'ACTIVE',
        emailVerified: false,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // 7. Return success response
    return NextResponse.json(
      {
        success: true,
        message:
          'Account created successfully. You can now log in.',
        data: { user },
        requestId,
      },
      { status: 201 }
    );
  } catch (error) {
    const { status, body } = formatErrorResponse(error, requestId);
    return NextResponse.json(body, { status });
  }
}
