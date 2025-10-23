import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Verify the workout belongs to the user
    const workout = await prisma.workout.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!workout || workout.userId !== userId.value) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Get workout details for activity feed
    const workoutWithDetails = await prisma.workout.findUnique({
      where: { id },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
    });

    if (!workoutWithDetails) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Update workout as completed
    const updatedWorkout = await prisma.workout.update({
      where: { id },
      data: { completed: true },
    });

    // Count completed sets
    const totalSets = workoutWithDetails.exercises.reduce(
      (sum, exercise) => sum + exercise.sets.filter((set) => set.completed).length,
      0
    );

    // Get exercise names
    const exerciseNames = workoutWithDetails.exercises.map((ex) => ex.name);

    // Update last workout date in stats
    await prisma.stats.update({
      where: { userId: userId.value },
      data: { lastWorkoutDate: new Date() },
    });

    // Create friend activity
    await prisma.friendActivity.create({
      data: {
        userId: userId.value,
        activityType: 'WORKOUT_COMPLETED',
        data: {
          exerciseCount: workoutWithDetails.exercises.length,
          setsCompleted: totalSets,
          exercises: exerciseNames,
          timestamp: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json(updatedWorkout);
  } catch (error) {
    console.error('Failed to complete workout:', error);
    return NextResponse.json({ error: 'Failed to complete workout' }, { status: 500 });
  }
}
