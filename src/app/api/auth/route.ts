import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { checkRateLimit, recordAttempt, resetAttempts } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };

    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    // Rate limiting by username
    const rateLimit = checkRateLimit(`login:${username}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please try again later.",
          resetAt: rateLimit.resetAt,
        },
        { status: 429 },
      );
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.password) {
      recordAttempt(`login:${username}`);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      recordAttempt(`login:${username}`);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }

    // Reset rate limit on successful login
    resetAttempts(`login:${username}`);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      userId: user.id,
      name: user.name,
    });

    response.cookies.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        error: "Failed to login",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
