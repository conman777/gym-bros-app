import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRehabExercises } from "@/lib/demo-data";
import { requireDevlinUser } from "@/lib/auth-helpers";
import { groupExercisesByCategory } from "@/lib/rehab-helpers";
import type { RehabExercise } from "@/lib/types";

/**
 * API endpoint to fix missing rehab exercises for Devlin
 * POST to: /api/diagnostic/fix-devlin-rehab
 * Requires: Devlin user authentication
 */
export async function POST() {
  try {
    // Require authentication as Devlin user
    const auth = await requireDevlinUser();
    if (!auth.authorized) {
      return auth.response;
    }

    console.log("[FIX-REHAB] Checking for existing exercises...");

    const devlinUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        rehabExercises: true,
      },
    });

    if (!devlinUser) {
      return NextResponse.json(
        {
          status: "ERROR",
          message: "User data not found",
        },
        { status: 404 }
      );
    }

    console.log(
      `[FIX-REHAB] Found user (ID: ${devlinUser.id}), current rehab exercises: ${devlinUser.rehabExercises.length}`
    );

    // Delete existing rehab exercises if any
    if (devlinUser.rehabExercises.length > 0) {
      console.log("[FIX-REHAB] Deleting existing rehab exercises...");
      const deleteResult = await prisma.rehabExercise.deleteMany({
        where: { userId: devlinUser.id },
      });

      if (deleteResult.count !== devlinUser.rehabExercises.length) {
        console.error(
          `[FIX-REHAB] Warning: Expected to delete ${devlinUser.rehabExercises.length} exercises but deleted ${deleteResult.count}`
        );
      }

      console.log(
        `[FIX-REHAB] Deleted ${deleteResult.count} existing exercises`
      );
    }

    // Create new rehab exercises
    console.log("[FIX-REHAB] Creating fresh set of rehab exercises...");
    await createRehabExercises(devlinUser.id);

    // Verify creation
    const updatedUser = await prisma.user.findUnique({
      where: { id: devlinUser.id },
      include: {
        rehabExercises: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!updatedUser || updatedUser.rehabExercises.length === 0) {
      console.error("[FIX-REHAB] Failed to create rehab exercises");
      return NextResponse.json(
        {
          status: "ERROR",
          message: "Failed to create rehab exercises",
        },
        { status: 500 }
      );
    }

    console.log(
      `[FIX-REHAB] Successfully created ${updatedUser.rehabExercises.length} rehab exercises`
    );

    // Group by category using helper
    const categories = groupExercisesByCategory(
      updatedUser.rehabExercises as RehabExercise[]
    );

    return NextResponse.json({
      status: "SUCCESS",
      message: `Successfully created ${updatedUser.rehabExercises.length} rehab exercises for Devlin`,
      data: {
        userId: devlinUser.id,
        totalExercises: updatedUser.rehabExercises.length,
        exercisesByCategory: categories,
      },
    });
  } catch (error) {
    console.error("[FIX-REHAB] Error:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
