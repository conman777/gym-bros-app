/**
 * Diagnostic script to check Devlin user and rehab exercises
 * Run with: npx tsx scripts/check-devlin-rehab.ts
 */

import { prisma } from "../src/lib/prisma";

async function checkDevlinRehab() {
  try {
    console.log("🔍 Checking Devlin user and rehab exercises...\n");

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
      console.log("❌ Devlin user not found in database!");
      console.log("\n💡 Solution: Log in as 'Devlin' on the home page to create the user.\n");
      return;
    }

    console.log("✅ Devlin user found!");
    console.log(`   User ID: ${devlinUser.id}`);
    console.log(`   Setup Complete: ${devlinUser.setupComplete}`);
    console.log(`   Total Sets Completed: ${devlinUser.stats?.totalSetsCompleted || 0}`);
    console.log(
      `   Rehab Exercises Count: ${devlinUser.rehabExercises.length}\n`
    );

    if (devlinUser.rehabExercises.length === 0) {
      console.log("⚠️  No rehab exercises found for Devlin!");
      console.log("\n💡 Solutions:");
      console.log("   1. Log out and log back in as Devlin to trigger setup");
      console.log("   2. Go to /rehab/manage to manually add exercises");
      console.log(
        "   3. Run: npx tsx scripts/create-rehab-exercises.ts (if this script exists)\n"
      );
    } else {
      console.log(
        `📋 Rehab Exercises (${devlinUser.rehabExercises.length} total):\n`
      );

      // Group by category
      const categories = devlinUser.rehabExercises.reduce(
        (acc, ex) => {
          const cat = ex.category || "Uncategorized";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(ex);
          return acc;
        },
        {} as Record<string, typeof devlinUser.rehabExercises>
      );

      Object.entries(categories).forEach(([category, exercises]) => {
        console.log(`\n   ${category}:`);
        exercises.forEach((ex) => {
          const status = ex.completed ? "✓" : "○";
          const prescription = [];

          if (ex.setsLeft || ex.setsRight) {
            prescription.push(
              `L: ${ex.setsLeft || 0} / R: ${ex.setsRight || 0} sets`
            );
          } else if (ex.sets) {
            prescription.push(`${ex.sets} sets`);
          }
          if (ex.reps) prescription.push(`${ex.reps} reps`);
          if (ex.hold) prescription.push(`hold ${ex.hold}s`);
          if (ex.load) prescription.push(ex.load);
          if (ex.bandColor) prescription.push(`${ex.bandColor} band`);
          if (ex.time) prescription.push(ex.time);

          console.log(
            `      ${status} ${ex.name}${prescription.length > 0 ? ` - ${prescription.join(" • ")}` : ""}`
          );
        });
      });

      const completedCount = devlinUser.rehabExercises.filter(
        (ex) => ex.completed
      ).length;
      console.log(
        `\n   📊 Progress: ${completedCount}/${devlinUser.rehabExercises.length} completed (${Math.round((completedCount / devlinUser.rehabExercises.length) * 100)}%)\n`
      );
    }

    // Check all users
    console.log("👥 All users in database:");
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

    allUsers.forEach((user) => {
      console.log(
        `   - ${user.name} (${user._count.workouts} workouts, ${user._count.rehabExercises} rehab exercises)`
      );
    });

    console.log("\n✨ Diagnostic complete!\n");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDevlinRehab();
