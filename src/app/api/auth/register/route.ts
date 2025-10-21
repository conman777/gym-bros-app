import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createDemoWorkouts } from "@/lib/demo-data";
import {
  createJob,
  startJob,
  updateJobProgress,
  completeJob,
  failJob,
} from "@/lib/background-jobs";

// Background job function (runs async, doesn't block response)
async function setupNewUserData(
  userId: string,
  userName: string,
  jobId: string,
) {
  try {
    startJob(jobId);

    updateJobProgress(jobId, 10);
    await createDemoWorkouts(userId, userName as "Conor" | "Devlin");

    updateJobProgress(jobId, 90);

    // Mark setup as complete in database
    await prisma.user.update({
      where: { id: userId },
      data: { setupComplete: true },
    });

    completeJob(jobId);
  } catch (error) {
    console.error("Setup job failed:", error);
    failJob(jobId, String(error));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Check if name already exists
    const existingName = await prisma.user.findUnique({
      where: { name },
    });

    if (existingName) {
      return NextResponse.json(
        { error: "Name already taken" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with stats
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        rehabEnabled: false,
        stats: {
          create: {},
        },
      },
      select: { id: true, name: true },
    });

    // Trigger background job for demo data (don't await it)
    const jobId = createJob(user.id);
    setupNewUserData(user.id, user.name, jobId).catch((error) => {
      console.error("Unhandled setup error:", error);
    });

    // Set cookie and return immediately
    const response = NextResponse.json({
      success: true,
      userId: user.id,
      name: user.name,
      isNewUser: true,
      setupJobId: jobId,
    });

    response.cookies.set("userId", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
