import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookies } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// GET user settings
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserFromCookies();

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        rehabEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PATCH update user settings
export async function PATCH(request: NextRequest) {
  try {
    const auth = await getUserFromCookies();

    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rehabEnabled } = body;

    // Validate input
    if (typeof rehabEnabled !== "boolean") {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    // Update user settings
    const user = await prisma.user.update({
      where: { id: auth.userId },
      data: { rehabEnabled },
      select: {
        id: true,
        name: true,
        email: true,
        rehabEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Settings PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
