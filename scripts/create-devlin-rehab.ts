/**
 * Script to manually create rehab exercises for Devlin user
 * Run with: npx tsx scripts/create-devlin-rehab.ts
 */

import { prisma } from '../src/lib/prisma';
import { createRehabExercises } from '../src/lib/demo-data';

async function main() {
  console.log('🔍 Checking for Devlin user...\n');

  const devlinUser = await prisma.user.findUnique({
    where: { name: 'Devlin' },
    include: {
      rehabExercises: true,
    },
  });

  if (!devlinUser) {
    console.error('❌ Devlin user not found!');
    console.log('Please log in as Devlin first to create the user.\n');
    process.exit(1);
  }

  console.log(`✅ Found Devlin user (ID: ${devlinUser.id})`);
  console.log(`   Current rehab exercises: ${devlinUser.rehabExercises.length}\n`);

  if (devlinUser.rehabExercises.length > 0) {
    console.log('⚠️  Rehab exercises already exist. Deleting old ones first...');
    await prisma.rehabExercise.deleteMany({
      where: { userId: devlinUser.id },
    });
    console.log('✓ Deleted existing rehab exercises\n');
  }

  console.log('📝 Creating rehab exercises...');
  await createRehabExercises(devlinUser.id);

  // Verify creation
  const updatedUser = await prisma.user.findUnique({
    where: { id: devlinUser.id },
    include: {
      rehabExercises: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  console.log(`\n✅ Successfully created ${updatedUser?.rehabExercises.length} rehab exercises!\n`);

  // Display created exercises
  if (updatedUser?.rehabExercises) {
    const categories = updatedUser.rehabExercises.reduce(
      (acc, ex) => {
        const cat = ex.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(ex);
        return acc;
      },
      {} as Record<string, typeof updatedUser.rehabExercises>
    );

    console.log('📋 Created Exercises by Category:\n');
    Object.entries(categories).forEach(([category, exercises]) => {
      console.log(`   ${category}:`);
      exercises.forEach((ex) => {
        const prescription = [];
        if (ex.setsLeft || ex.setsRight) {
          prescription.push(`L: ${ex.setsLeft || 0} / R: ${ex.setsRight || 0} sets`);
        } else if (ex.sets) {
          prescription.push(`${ex.sets} sets`);
        }
        if (ex.reps) prescription.push(`${ex.reps} reps`);
        if (ex.hold) prescription.push(`hold ${ex.hold}s`);
        if (ex.load) prescription.push(ex.load);
        if (ex.bandColor) prescription.push(`${ex.bandColor} band`);
        if (ex.time) prescription.push(ex.time);

        console.log(
          `      ○ ${ex.name}${prescription.length > 0 ? ` - ${prescription.join(' • ')}` : ''}`
        );
      });
      console.log();
    });
  }

  console.log('🎉 Done! Refresh the dashboard to see the rehab exercises.\n');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
