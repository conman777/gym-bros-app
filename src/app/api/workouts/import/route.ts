import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import type { WorkoutTemplate } from '@/lib/types';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workouts, startDate } = (await request.json()) as {
      workouts: WorkoutTemplate[];
      startDate: string;
    };

    // Create a map of day names to workout templates
    const workoutMap = new Map<string, WorkoutTemplate>();
    workouts.forEach((workout) => {
      const dayMatch = workout.day.match(
        /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i
      );
      if (dayMatch) {
        workoutMap.set(dayMatch[1].toLowerCase(), workout);
      }
    });

    // Generate workouts for the next 4 weeks
    const startDateObj = new Date(startDate);
    const createdWorkouts = [];

    for (let week = 0; week < 4; week++) {
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const currentDate = new Date(startDateObj);
        currentDate.setDate(startDateObj.getDate() + week * 7 + dayOffset);

        const dayName = DAYS_OF_WEEK[currentDate.getDay()].toLowerCase();
        const template = workoutMap.get(dayName);

        if (template) {
          const workout = await prisma.workout.create({
            data: {
              userId: userId.value,
              date: currentDate,
              exercises: {
                create: template.exercises.map((exercise, index) => ({
                  name: exercise.name,
                  orderIndex: index,
                  sets: {
                    create: Array.from({ length: exercise.sets }, (_, setIndex) => ({
                      reps: exercise.reps,
                      weight: exercise.weight,
                      orderIndex: setIndex,
                    })),
                  },
                })),
              },
            },
          });
          createdWorkouts.push(workout);
        }
      }
    }

    return NextResponse.json({
      success: true,
      count: createdWorkouts.length,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import workouts' }, { status: 500 });
  }
}
