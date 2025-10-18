import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDemoWorkouts, createRehabExercises } from "@/lib/demo-data";
import {
  createJob,
  startJob,
  updateJobProgress,
  completeJob,
  failJob,
} from "@/lib/background-jobs";
import type { UserName } from "@/lib/types";

// Background job function (runs async, doesn't block response)
async function setupNewUserData(
  userId: string,
  userName: UserName,
  jobId: string,
) {
  try {
    startJob(jobId);

    updateJobProgress(jobId, 10);
    await createDemoWorkouts(userId, userName);

    updateJobProgress(jobId, 60);

    // Create rehab exercises for Devlin
    if (userName === "Devlin") {
      await createRehabExercises(userId);
    }

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
    const { userName } = (await request.json()) as { userName?: UserName };

    if (!userName || (userName !== "Conor" && userName !== "Devlin")) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { name: userName },
      include: {
        workouts: {
          take: 1,
        },
      },
    });

    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: userName,
          stats: {
            create: {},
          },
        },
        include: {
          workouts: {
            take: 1,
          },
        },
      });
      isNewUser = true;
    } else if (user.workouts.length === 0) {
      // Existing user but no workouts
      isNewUser = true;
    }

    let jobId: string | undefined;

    // Trigger background job for new users (don't await it)
    if (isNewUser) {
      jobId = createJob(user.id);
      // Fire and forget - don't await
      setupNewUserData(user.id, userName, jobId).catch((error) => {
        console.error("Unhandled setup error:", error);
      });
    }

    // Set cookie and return immediately
    const response = NextResponse.json({
      success: true,
      userId: user.id,
      isNewUser,
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
    console.error("Auth error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack",
    );
    console.error("Environment check:", {
      hasTursoUrl: !!process.env.DATABASE_TURSO_DATABASE_URL,
      hasTursoToken: !!process.env.DATABASE_TURSO_AUTH_TOKEN,
      nodeEnv: process.env.NODE_ENV,
    });
    return NextResponse.json(
      {
        error: "Failed to authenticate",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
