import { prisma } from "@/lib/prisma";
import type { UserName } from "@/lib/types";

type ExercisePlan = {
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

type WorkoutPlan = {
  name: string;
  exercises: ExercisePlan[];
};

const CONOR_PROGRAM: Record<number, WorkoutPlan> = {
  1: {
    name: "Upper Body",
    exercises: [
      { name: "Bench Press", sets: 3, reps: 10, weight: 43 },
      { name: "Dumbbell Rows", sets: 3, reps: 10, weight: 14 },
      { name: "Overhead Press", sets: 3, reps: 8, weight: 30 },
      { name: "Bicep Curls", sets: 3, reps: 12, weight: 9 },
      { name: "Tricep Extensions", sets: 3, reps: 12, weight: 7 },
    ],
  },
  3: {
    name: "Lower Body",
    exercises: [
      { name: "Squats", sets: 3, reps: 10, weight: 43 },
      { name: "Walking Lunges", sets: 3, reps: 10, weight: 0 },
      { name: "Leg Press", sets: 3, reps: 12, weight: 82 },
      { name: "Calf Raises", sets: 3, reps: 15, weight: 45 },
      { name: "Leg Curls", sets: 3, reps: 12, weight: 23 },
    ],
  },
  5: {
    name: "Full Body",
    exercises: [
      { name: "Deadlifts", sets: 3, reps: 5, weight: 61 },
      { name: "Pull-ups", sets: 3, reps: 5, weight: 0 },
      { name: "Dumbbell Press", sets: 3, reps: 10, weight: 18 },
      { name: "Plank", sets: 3, reps: 30, weight: 0 },
      { name: "Face Pulls", sets: 3, reps: 15, weight: 9 },
    ],
  },
};

const DEVLIN_REHAB_SESSION: WorkoutPlan = {
  name: "Shoulder Rehab Session",
  exercises: [
    { name: "Warm-up | Rowing (3-5 min)", sets: 1, reps: 300, weight: 0 },
    { name: "Sleeper Stretch (Left - hold 20s)", sets: 1, reps: 20, weight: 0 },
    {
      name: "Sleeper Stretch (Right - hold 20s)",
      sets: 2,
      reps: 20,
      weight: 0,
    },
    {
      name: "Lat Dorsi Stretch on Bench (hold 20s)",
      sets: 2,
      reps: 20,
      weight: 0,
    },
    {
      name: "Pec Stretch Doorway (Left - hold 20s)",
      sets: 1,
      reps: 20,
      weight: 0,
    },
    {
      name: "Pec Stretch Doorway (Right - hold 20s)",
      sets: 2,
      reps: 20,
      weight: 0,
    },
    {
      name: "Shoulder Internal Rotation | Towel (Left - hold 20s)",
      sets: 1,
      reps: 20,
      weight: 0,
    },
    {
      name: "Shoulder Internal Rotation | Towel (Right - hold 20s)",
      sets: 2,
      reps: 20,
      weight: 0,
    },
    {
      name: "External Rotation | Band (Seated on Ball, hold 2s)",
      sets: 1,
      reps: 10,
      weight: 0,
    },
    {
      name: "External Rotation | Band (Left - hold 2s)",
      sets: 2,
      reps: 8,
      weight: 0,
    },
    {
      name: "External Rotation | Band (Right - hold 2s)",
      sets: 1,
      reps: 8,
      weight: 0,
    },
    {
      name: "Abduction in Scapular Plane (Left)",
      sets: 2,
      reps: 10,
      weight: 2,
    },
    {
      name: "Abduction in Scapular Plane (Right)",
      sets: 1,
      reps: 10,
      weight: 2,
    },
    {
      name: "External Rotation | Dumbbell (Left)",
      sets: 2,
      reps: 10,
      weight: 2,
    },
    {
      name: "External Rotation | Dumbbell (Right)",
      sets: 1,
      reps: 10,
      weight: 2,
    },
    {
      name: "Horizontal Extension Prone | Dumbbell (Left)",
      sets: 2,
      reps: 10,
      weight: 2,
    },
    {
      name: "Horizontal Extension Prone | Dumbbell (Right)",
      sets: 1,
      reps: 10,
      weight: 2,
    },
    { name: "Supported Bent-over Row (Left)", sets: 2, reps: 8, weight: 7.5 },
    { name: "Supported Bent-over Row (Right)", sets: 1, reps: 8, weight: 7.5 },
    { name: "Seated Low Row (Neutral Grip)", sets: 2, reps: 10, weight: 35 },
    { name: "Dumbbell Hammer Curls", sets: 2, reps: 10, weight: 7.5 },
    {
      name: "Triceps Cable Pulldown (Standing)",
      sets: 2,
      reps: 10,
      weight: 17.5,
    },
  ],
};

const PROGRAMS: Record<UserName, Record<number, WorkoutPlan>> = {
  Conor: CONOR_PROGRAM,
  Devlin: {
    1: DEVLIN_REHAB_SESSION,
    3: DEVLIN_REHAB_SESSION,
    5: DEVLIN_REHAB_SESSION,
  },
};

function cloneWorkoutPlan(plan: WorkoutPlan): WorkoutPlan {
  return {
    name: plan.name,
    exercises: plan.exercises.map((exercise) => ({ ...exercise })),
  };
}

export async function createDemoWorkouts(userId: string, userName: UserName) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const program = PROGRAMS[userName] ?? PROGRAMS.Conor;
  const baseCompletionRate = userName === "Devlin" ? 0.95 : 0.85;

  const workoutsToCreate: Array<{
    date: Date;
    workout: WorkoutPlan;
    completed: boolean;
    completionRate: number;
  }> = [];

  for (let daysAgo = 7; daysAgo >= 1; daysAgo--) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);

    const dayOfWeek = date.getDay();
    const template = program[dayOfWeek];

    if (!template) continue;

    const completed = daysAgo > 2;
    const completionRate = completed ? baseCompletionRate : 0;

    workoutsToCreate.push({
      date,
      workout: cloneWorkoutPlan(template),
      completed,
      completionRate,
    });
  }

  for (let daysAhead = 0; daysAhead <= 14; daysAhead++) {
    const date = new Date(today);
    date.setDate(date.getDate() + daysAhead);

    const dayOfWeek = date.getDay();
    const template = program[dayOfWeek];

    if (!template) continue;

    workoutsToCreate.push({
      date,
      workout: cloneWorkoutPlan(template),
      completed: false,
      completionRate: 0,
    });
  }

  let totalSetsCompleted = 0;
  let totalExercisesCompleted = 0;

  // Pre-calculate all set data before creating workouts to count stats
  const workoutDataWithStats = workoutsToCreate.map(
    ({ date, workout, completed, completionRate }) => {
      const exercises = workout.exercises.map((exercise, index) => {
        const setsData = Array.from(
          { length: exercise.sets },
          (_, setIndex) => {
            const isCompleted = completed && Math.random() < completionRate;

            if (isCompleted) {
              totalSetsCompleted++;
            }

            return {
              reps: exercise.reps,
              weight: exercise.weight,
              orderIndex: setIndex,
              completed: isCompleted,
            };
          },
        );

        if (setsData.length > 0 && setsData.every((set) => set.completed)) {
          totalExercisesCompleted++;
        }

        return {
          name: exercise.name,
          orderIndex: index,
          sets: {
            create: setsData,
          },
        };
      });

      return {
        date,
        completed,
        exercises,
      };
    },
  );

  // Create all workouts in parallel
  await Promise.all(
    workoutDataWithStats.map((workoutData) =>
      prisma.workout.create({
        data: {
          userId,
          date: workoutData.date,
          completed: workoutData.completed,
          exercises: {
            create: workoutData.exercises,
          },
        },
      }),
    ),
  );

  const statsUpdate: {
    totalSetsCompleted?: { increment: number };
    totalExercises?: { increment: number };
    lastWorkoutDate?: Date;
  } = {};

  if (totalSetsCompleted > 0) {
    statsUpdate.totalSetsCompleted = { increment: totalSetsCompleted };
    statsUpdate.lastWorkoutDate = new Date(
      today.getTime() - 2 * 24 * 60 * 60 * 1000,
    );
  }

  if (totalExercisesCompleted > 0) {
    statsUpdate.totalExercises = { increment: totalExercisesCompleted };
  }

  if (Object.keys(statsUpdate).length > 0) {
    await prisma.stats.update({
      where: { userId },
      data: statsUpdate,
    });
  }

  return workoutsToCreate.length;
}

const DEVLIN_REHAB_EXERCISES = [
  // Warm-up
  {
    name: "Rowing",
    category: "Warm-up",
    time: "3-5 min",
    cues: "Long spine, shoulders level, initiate with legs → back → arms; return arms → body → legs.",
  },

  // Mobility & Stretching
  {
    name: "Sleeper Stretch",
    category: "Mobility & Stretching",
    setsLeft: 1,
    setsRight: 2,
    hold: 20,
    cues: "Side-lying, shoulder & elbow at 90°, gently lower palm toward floor without lifting shoulder blade.",
  },
  {
    name: "Lat Dorsi Stretch on Bench",
    category: "Mobility & Stretching",
    sets: 2,
    hold: 20,
    cues: "Kneel, elbows on bench, lower chest maintaining neutral spine.",
  },
  {
    name: "Pec Stretch (Doorway/Frame)",
    category: "Mobility & Stretching",
    setsLeft: 1,
    setsRight: 2,
    hold: 20,
    cues: "Forearm vertical on frame, step forward to feel chest stretch.",
  },
  {
    name: "Shoulder Internal Rotation (Towel Behind Back)",
    category: "Mobility & Stretching",
    setsLeft: 1,
    setsRight: 2,
    hold: 20,
    cues: "One hand over shoulder, other behind back holding towel; gently pull to stretch lower hand shoulder.",
  },

  // Band / Dumbbell / Machine Strength
  {
    name: "Shoulder External Rotation w/ Resistance Band",
    category: "Band / Dumbbell / Machine Strength",
    sets: 1,
    reps: 10,
    hold: 2,
    bandColor: "Green",
    cues: "Seated on gym ball, elbows tucked at sides, rotate out then control back.",
  },
  {
    name: "External Shoulder Rotation w/ Resistance Band",
    category: "Band / Dumbbell / Machine Strength",
    setsLeft: 2,
    setsRight: 1,
    reps: 8,
    hold: 2,
    bandColor: "Green",
    cues: "Arm bent, elbow close to side, turn forearm outward, return across body with control.",
  },
  {
    name: "Abduction in Plane of Scapula",
    category: "Band / Dumbbell / Machine Strength",
    setsLeft: 2,
    setsRight: 1,
    reps: 10,
    load: "2 kg",
    cues: "Thumb up, raise arm ~20-30° anterior to frontal plane to shoulder height; lower slowly.",
  },
  {
    name: "Shoulder External Rotation w/ Dumbbell",
    category: "Band / Dumbbell / Machine Strength",
    setsLeft: 2,
    setsRight: 1,
    reps: 10,
    load: "2 kg",
    cues: "Side-lying, elbow tucked, rotate to raise hand, lower with control.",
  },
  {
    name: "Horizontal Extension (Prone) w/ Dumbbell",
    category: "Band / Dumbbell / Machine Strength",
    setsLeft: 2,
    setsRight: 1,
    reps: 10,
    load: "2 kg",
    cues: "Prone, arm hangs off bed, raise out to side, lower down.",
  },
  {
    name: "Supported Bent-Over Row",
    category: "Band / Dumbbell / Machine Strength",
    setsLeft: 2,
    setsRight: 1,
    reps: 8,
    load: "7.5 kg",
    cues: "One hand braced on bench, row dumbbell to side, squeeze shoulder blade, lower slowly.",
  },
  {
    name: "Seated Low Row (Neutral Grip)",
    category: "Band / Dumbbell / Machine Strength",
    sets: 2,
    reps: 10,
    load: "35 kg",
    cues: "Shoulders down/back, pull handles to sides, control return.",
  },
  {
    name: "Dumbbell Hammer Curls",
    category: "Band / Dumbbell / Machine Strength",
    sets: 2,
    reps: 10,
    load: "7.5 kg",
    cues: "Palms facing in, elbows close to body, curl then lower.",
  },
  {
    name: "Triceps Cable Pulldown (Standing)",
    category: "Band / Dumbbell / Machine Strength",
    sets: 2,
    reps: 10,
    load: "17.5 kg",
    cues: "Tall posture, start elbows ~90°, extend fully to sides, return to ~90°.",
  },
];

export async function createRehabExercises(userId: string) {
  // Batch create all rehab exercises in a single operation instead of sequential loops
  await prisma.rehabExercise.createMany({
    data: DEVLIN_REHAB_EXERCISES.map((exercise, i) => ({
      userId,
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
      orderIndex: i,
    })),
  });
}
