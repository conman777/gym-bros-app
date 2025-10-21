import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePassword } from "@/lib/password";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      username?: string;
      password?: string;
    };

    const { name, username, password } = body;

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "Name, username, and password are required" },
        { status: 400 },
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: "Invalid password", errors: passwordValidation.errors },
        { status: 400 },
      );
    }

    // Find user by name (for existing users like Conor/Devlin)
    const user = await prisma.user.findUnique({
      where: { name },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if username is already taken by another user
    const existingUsername = await prisma.user.findFirst({
      where: {
        username,
        id: { not: user.id },
      },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Update user with username and password
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username,
        password: hashedPassword,
      },
    });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      userId: updatedUser.id,
    });

    response.cookies.set("userId", updatedUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Set password error:", error);
    return NextResponse.json(
      {
        error: "Failed to set password",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
