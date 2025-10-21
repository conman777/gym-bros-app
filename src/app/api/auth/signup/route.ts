import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePassword } from "@/lib/password";
import { checkRateLimit, recordAttempt } from "@/lib/rate-limit";
import {
  createJob,
  startJob,
  updateJobProgress,
  completeJob,
  failJob,
} from "@/lib/background-jobs";
import { createDemoWorkouts } from "@/lib/demo-data";
import type { UserName } from "@/lib/types";

async function setupNewUserData(
  userId: string,
  userName: string,
  jobId: string,
) {
  try {
    startJob(jobId);

    updateJobProgress(jobId, 10);

    // Only create demo workouts if userName is Conor or Devlin
    if (userName === "Conor" || userName === "Devlin") {
      await createDemoWorkouts(userId, userName as UserName);
    }

    updateJobProgress(jobId, 90);

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
    const body = (await request.json()) as {
      username?: string;
      password?: string;
      name?: string;
    };

    const { username, password, name } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: "Username, password, and name are required" },
        { status: 400 },
      );
    }

    // Rate limiting by username
    const rateLimit = checkRateLimit(`signup:${username}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Too many signup attempts. Please try again later.",
          resetAt: rateLimit.resetAt,
        },
        { status: 429 },
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      recordAttempt(`signup:${username}`);
      return NextResponse.json(
        { error: "Invalid password", errors: passwordValidation.errors },
        { status: 400 },
      );
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      recordAttempt(`signup:${username}`);
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        stats: {
          create: {},
        },
      },
    });

    // Create background job for demo data
    const jobId = createJob(user.id);
    setupNewUserData(user.id, name, jobId).catch((error) => {
      console.error("Unhandled setup error:", error);
    });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      userId: user.id,
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
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        error: "Failed to create account",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
