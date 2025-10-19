import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Diagnostic API to check Devlin user and rehab exercises
 * Access at: /api/diagnostic/devlin
 */
export async function GET() {
  try {
    // Check if Devlin user exists
    const devlinUser = await prisma.user.findUnique({
      where: { name: "Devlin" },
      include: {
        rehabExercises: {
          orderBy: { orderIndex: "asc" },
        },
        stats: true,
      },
    });

    if (!devlinUser) {
      return NextResponse.json({
        status: "NOT_FOUND",
        message: "Devlin user not found in database",
        solution:
          "Log in as 'Devlin' on the home page to create the user and rehab exercises",
      });
    }

    // Group exercises by category
    const categories = devlinUser.rehabExercises.reduce(
      (acc, ex) => {
        const cat = ex.category || "Uncategorized";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push({
          id: ex.id,
          name: ex.name,
          completed: ex.completed,
          setsLeft: ex.setsLeft,
          setsRight: ex.setsRight,
          sets: ex.sets,
          reps: ex.reps,
          hold: ex.hold,
          load: ex.load,
          bandColor: ex.bandColor,
          time: ex.time,
        });
        return acc;
      },
      {} as Record<string, any[]>
    );

    const completedCount = devlinUser.rehabExercises.filter(
      (ex) => ex.completed
    ).length;

    // Get all users
    const allUsers = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            workouts: true,
            rehabExercises: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: "SUCCESS",
      devlinUser: {
        id: devlinUser.id,
        name: devlinUser.name,
        setupComplete: devlinUser.setupComplete,
        totalSetsCompleted: devlinUser.stats?.totalSetsCompleted || 0,
        rehabExercisesCount: devlinUser.rehabExercises.length,
        rehabExercisesCompleted: completedCount,
        progressPercentage: devlinUser.rehabExercises.length
          ? Math.round(
              (completedCount / devlinUser.rehabExercises.length) * 100
            )
          : 0,
      },
      rehabExercises: {
        total: devlinUser.rehabExercises.length,
        completed: completedCount,
        byCategory: categories,
      },
      allUsers: allUsers.map((user) => ({
        name: user.name,
        workoutsCount: user._count.workouts,
        rehabExercisesCount: user._count.rehabExercises,
      })),
    });
  } catch (error) {
    console.error("Diagnostic error:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
