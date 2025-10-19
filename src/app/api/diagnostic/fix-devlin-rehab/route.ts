import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRehabExercises } from "@/lib/demo-data";

/**
 * API endpoint to fix missing rehab exercises for Devlin
 * POST to: /api/diagnostic/fix-devlin-rehab
 */
export async function POST() {
  try {
    console.log("🔍 Checking for Devlin user...");

    const devlinUser = await prisma.user.findUnique({
      where: { name: "Devlin" },
      include: {
        rehabExercises: true,
      },
    });

    if (!devlinUser) {
      return NextResponse.json(
        {
          status: "ERROR",
          message: "Devlin user not found in database",
          solution: "Log in as Devlin first to create the user",
        },
        { status: 404 }
      );
    }

    console.log(
      `✅ Found Devlin user (ID: ${devlinUser.id}), current rehab exercises: ${devlinUser.rehabExercises.length}`
    );

    // Delete existing rehab exercises if any
    if (devlinUser.rehabExercises.length > 0) {
      console.log("⚠️  Deleting existing rehab exercises...");
      await prisma.rehabExercise.deleteMany({
        where: { userId: devlinUser.id },
      });
      console.log("✓ Deleted existing rehab exercises");
    }

    // Create new rehab exercises
    console.log("📝 Creating rehab exercises...");
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

    console.log(
      `✅ Successfully created ${updatedUser?.rehabExercises.length} rehab exercises!`
    );

    // Group by category for response
    const categories =
      updatedUser?.rehabExercises.reduce(
        (acc, ex) => {
          const cat = ex.category || "Uncategorized";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push({
            id: ex.id,
            name: ex.name,
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
      ) || {};

    return NextResponse.json({
      status: "SUCCESS",
      message: `Successfully created ${updatedUser?.rehabExercises.length} rehab exercises for Devlin`,
      data: {
        userId: devlinUser.id,
        totalExercises: updatedUser?.rehabExercises.length,
        exercisesByCategory: categories,
      },
    });
  } catch (error) {
    console.error("Error fixing Devlin rehab:", error);
    return NextResponse.json(
      {
        status: "ERROR",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
