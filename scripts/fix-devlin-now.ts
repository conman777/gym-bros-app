/**
 * Quick script to create Devlin's rehab exercises
 * Run with: npx tsx scripts/fix-devlin-now.ts
 */

import { PrismaClient } from '@prisma/client';
import { createRehabExercises } from '../src/lib/demo-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Finding Devlin user...');

  const devlin = await prisma.user.findUnique({
    where: { name: 'Devlin' },
    include: { rehabExercises: true },
  });

  if (!devlin) {
    console.error('ERROR: Devlin user not found. Please log in as Devlin first.');
    process.exit(1);
  }

  console.log(`Found Devlin (ID: ${devlin.id})`);
  console.log(`Current rehab exercises: ${devlin.rehabExercises.length}`);

  if (devlin.rehabExercises.length > 0) {
    console.log('Deleting existing exercises...');
    await prisma.rehabExercise.deleteMany({
      where: { userId: devlin.id },
    });
  }

  console.log('Creating 13 rehab exercises...');
  await createRehabExercises(devlin.id);

  const updated = await prisma.user.findUnique({
    where: { id: devlin.id },
    include: { rehabExercises: true },
  });

  console.log(`\nSUCCESS! Created ${updated?.rehabExercises.length} rehab exercises.`);
  console.log('\nRefresh your dashboard to see them!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
