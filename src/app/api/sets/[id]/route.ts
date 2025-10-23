import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { updateSetSchema } from '@/lib/validation-schemas';
import { handleApiError, ApiErrors } from '@/lib/api-errors';
import { calculateStatsDeltas, applyStatsDeltas } from '@/lib/stats-helpers';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId');

    if (!userId) {
      throw ApiErrors.Unauthorized;
    }

    const { id } = await context.params;

    // Validate request body
    const body = await request.json();
    const validatedData = updateSetSchema.parse(body);

    // Fetch set with related data
    const set = await prisma.set.findUnique({
      where: { id },
      include: {
        exercise: {
          include: {
            sets: true,
            workout: true,
          },
        },
      },
    });

    if (!set || set.exercise.workout.userId !== userId.value) {
      throw ApiErrors.NotFound;
    }

    // Update the set
    const previousCompleted = set.completed;
    const newCompleted = validatedData.completed ?? set.completed;

    const updatedSet = await prisma.set.update({
      where: { id },
      data: {
        completed: newCompleted,
        weight: validatedData.weight !== undefined ? validatedData.weight : set.weight,
      },
    });

    // Calculate and apply stats updates
    const otherSets = set.exercise.sets.filter((s) => s.id !== id);
    const otherSetsCompleted = otherSets.every((s) => s.completed);

    const deltas = calculateStatsDeltas(previousCompleted, newCompleted, otherSetsCompleted);

    if (deltas.setsDelta !== 0 || deltas.exercisesDelta !== 0) {
      const stats = await prisma.stats.findUnique({
        where: { userId: userId.value },
      });

      if (stats) {
        const { totalSets, totalExercises } = applyStatsDeltas(
          stats.totalSetsCompleted ?? 0,
          stats.totalExercises ?? 0,
          deltas
        );

        const updateData: {
          totalSetsCompleted: number;
          totalExercises: number;
          lastWorkoutDate?: Date | null;
        } = {
          totalSetsCompleted: totalSets,
          totalExercises: totalExercises,
        };

        if (deltas.setsDelta > 0 && newCompleted) {
          updateData.lastWorkoutDate = new Date();
        }

        await prisma.stats.update({
          where: { userId: userId.value },
          data: updateData,
        });
      }
    }

    return NextResponse.json(updatedSet);
  } catch (error) {
    return handleApiError(error, 'Failed to update set');
  }
}
