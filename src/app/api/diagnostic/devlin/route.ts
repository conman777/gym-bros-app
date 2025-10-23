import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireDevlinUser } from '@/lib/auth-helpers';
import { groupExercisesByCategory } from '@/lib/rehab-helpers';
import type { RehabExercise } from '@/lib/types';

/**
 * Diagnostic API to check Devlin user and rehab exercises
 * Access at: /api/diagnostic/devlin
 * Requires: Devlin user authentication
 */
export async function GET() {
  try {
    // Require authentication as Devlin user
    const auth = await requireDevlinUser();
    if (!auth.authorized) {
      return auth.response;
    }

    // Fetch Devlin's data
    const devlinUser = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        rehabExercises: {
          orderBy: { orderIndex: 'asc' },
        },
        stats: true,
      },
    });

    if (!devlinUser) {
      return NextResponse.json(
        {
          status: 'ERROR',
          message: 'User data not found',
        },
        { status: 404 }
      );
    }

    // Group exercises by category using helper
    const categories = groupExercisesByCategory(devlinUser.rehabExercises as RehabExercise[]);

    const completedCount = devlinUser.rehabExercises.filter((ex) => ex.completed).length;

    return NextResponse.json({
      status: 'SUCCESS',
      devlinUser: {
        id: devlinUser.id,
        name: devlinUser.name,
        setupComplete: devlinUser.setupComplete,
        totalSetsCompleted: devlinUser.stats?.totalSetsCompleted || 0,
        rehabExercisesCount: devlinUser.rehabExercises.length,
        rehabExercisesCompleted: completedCount,
        progressPercentage: devlinUser.rehabExercises.length
          ? Math.round((completedCount / devlinUser.rehabExercises.length) * 100)
          : 0,
      },
      rehabExercises: {
        total: devlinUser.rehabExercises.length,
        completed: completedCount,
        byCategory: categories,
      },
    });
  } catch (error) {
    console.error('[DIAGNOSTIC] Error:', error);
    return NextResponse.json(
      {
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
