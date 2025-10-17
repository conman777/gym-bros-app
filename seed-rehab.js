const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

const DEVLIN_REHAB_EXERCISES = [
  // Warm-up
  {
    name: 'Rowing',
    category: 'Warm-up',
    time: '3-5 min',
    cues: 'Long spine, shoulders level, initiate with legs → back → arms; return arms → body → legs.'
  },

  // Mobility & Stretching
  {
    name: 'Sleeper Stretch',
    category: 'Mobility & Stretching',
    setsLeft: 1,
    setsRight: 2,
    hold: 20,
    cues: 'Side-lying, shoulder & elbow at 90°, gently lower palm toward floor without lifting shoulder blade.'
  },
  {
    name: 'Lat Dorsi Stretch on Bench',
    category: 'Mobility & Stretching',
    sets: 2,
    hold: 20,
    cues: 'Kneel, elbows on bench, lower chest maintaining neutral spine.'
  },
  {
    name: 'Pec Stretch (Doorway/Frame)',
    category: 'Mobility & Stretching',
    setsLeft: 1,
    setsRight: 2,
    hold: 20,
    cues: 'Forearm vertical on frame, step forward to feel chest stretch.'
  },
  {
    name: 'Shoulder Internal Rotation (Towel Behind Back)',
    category: 'Mobility & Stretching',
    setsLeft: 1,
    setsRight: 2,
    hold: 20,
    cues: 'One hand over shoulder, other behind back holding towel; gently pull to stretch lower hand shoulder.'
  },

  // Band / Dumbbell / Machine Strength
  {
    name: 'Shoulder External Rotation w/ Resistance Band',
    category: 'Band / Dumbbell / Machine Strength',
    sets: 1,
    reps: 10,
    hold: 2,
    bandColor: 'Green',
    cues: 'Seated on gym ball, elbows tucked at sides, rotate out then control back.'
  },
  {
    name: 'External Shoulder Rotation w/ Resistance Band',
    category: 'Band / Dumbbell / Machine Strength',
    setsLeft: 2,
    setsRight: 1,
    reps: 8,
    hold: 2,
    bandColor: 'Green',
    cues: 'Arm bent, elbow close to side, turn forearm outward, return across body with control.'
  },
  {
    name: 'Abduction in Plane of Scapula',
    category: 'Band / Dumbbell / Machine Strength',
    setsLeft: 2,
    setsRight: 1,
    reps: 10,
    load: '2 kg',
    cues: 'Thumb up, raise arm ~20-30° anterior to frontal plane to shoulder height; lower slowly.'
  },
  {
    name: 'Shoulder External Rotation w/ Dumbbell',
    category: 'Band / Dumbbell / Machine Strength',
    setsLeft: 2,
    setsRight: 1,
    reps: 10,
    load: '2 kg',
    cues: 'Side-lying, elbow tucked, rotate to raise hand, lower with control.'
  },
  {
    name: 'Horizontal Extension (Prone) w/ Dumbbell',
    category: 'Band / Dumbbell / Machine Strength',
    setsLeft: 2,
    setsRight: 1,
    reps: 10,
    load: '2 kg',
    cues: 'Prone, arm hangs off bed, raise out to side, lower down.'
  },
  {
    name: 'Supported Bent-Over Row',
    category: 'Band / Dumbbell / Machine Strength',
    setsLeft: 2,
    setsRight: 1,
    reps: 8,
    load: '7.5 kg',
    cues: 'One hand braced on bench, row dumbbell to side, squeeze shoulder blade, lower slowly.'
  },
  {
    name: 'Seated Low Row (Neutral Grip)',
    category: 'Band / Dumbbell / Machine Strength',
    sets: 2,
    reps: 10,
    load: '35 kg',
    cues: 'Shoulders down/back, pull handles to sides, control return.'
  },
  {
    name: 'Dumbbell Hammer Curls',
    category: 'Band / Dumbbell / Machine Strength',
    sets: 2,
    reps: 10,
    load: '7.5 kg',
    cues: 'Palms facing in, elbows close to body, curl then lower.'
  },
  {
    name: 'Triceps Cable Pulldown (Standing)',
    category: 'Band / Dumbbell / Machine Strength',
    sets: 2,
    reps: 10,
    load: '17.5 kg',
    cues: 'Tall posture, start elbows ~90°, extend fully to sides, return to ~90°.'
  }
];

async function main() {
  console.log('Finding Devlin...');
  const devlin = await prisma.user.findUnique({ where: { name: 'Devlin' } });

  if (!devlin) {
    console.log('Devlin not found!');
    return;
  }

  console.log('Clearing existing rehab exercises...');
  await prisma.rehabExercise.deleteMany({ where: { userId: devlin.id } });

  console.log('Adding rehab exercises...');
  for (let i = 0; i < DEVLIN_REHAB_EXERCISES.length; i++) {
    const exercise = DEVLIN_REHAB_EXERCISES[i];
    await prisma.rehabExercise.create({
      data: {
        userId: devlin.id,
        name: exercise.name,
        category: exercise.category || null,
        setsLeft: exercise.setsLeft || null,
        setsRight: exercise.setsRight || null,
        sets: exercise.sets || null,
        reps: exercise.reps || null,
        hold: exercise.hold || null,
        load: exercise.load || null,
        bandColor: exercise.bandColor || null,
        time: exercise.time || null,
        cues: exercise.cues || null,
        orderIndex: i
      }
    });
    console.log(`  ✓ ${exercise.name}`);
  }

  console.log('Done! Added', DEVLIN_REHAB_EXERCISES.length, 'exercises');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
