import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { comparePassword } from "@/lib/auth/password";
import { validateRequest } from "@/lib/auth/validate-request";

/**
 * POST /api/v1/auth/verify-password
 * Used to reveal sensitive dashboard values (e.g., Total Ad Spend).
 * Verifies the currently logged-in user's password without issuing new tokens.
 * Body: { password: string }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the caller
    const authUser = await validateRequest(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    // 2. Parse body
    let body: { password?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { password } = body;
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 },
      );
    }

    // 3. Fetch the stored hash for this user
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    // 4. Compare — use bcrypt timing-safe compare
    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect password" },
        { status: 401 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[verify-password]", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
