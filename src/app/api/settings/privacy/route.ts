import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

// GET privacy settings
export async function GET(request: NextRequest) {
  try {
    const auth = await getUserFromCookies();

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create privacy settings
    let privacySettings = await prisma.privacySettings.findUnique({
      where: { userId: auth.userId },
    });

    // Create default privacy settings if they don't exist
    if (!privacySettings) {
      privacySettings = await prisma.privacySettings.create({
        data: {
          userId: auth.userId,
          showWorkoutDetails: true,
          showExerciseNames: true,
          showPerformanceTrends: true,
          showWorkoutSchedule: true,
        },
      });
    }

    return NextResponse.json(privacySettings);
  } catch (error) {
    console.error('Privacy settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch privacy settings' }, { status: 500 });
  }
}

// PATCH update privacy settings
export async function PATCH(request: NextRequest) {
  try {
    const auth = await getUserFromCookies();

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { showWorkoutDetails, showExerciseNames, showPerformanceTrends, showWorkoutSchedule } =
      body;

    // Validate input - at least one field must be provided
    const hasValidField = [
      showWorkoutDetails,
      showExerciseNames,
      showPerformanceTrends,
      showWorkoutSchedule,
    ].some((field) => typeof field === 'boolean');

    if (!hasValidField) {
      return NextResponse.json(
        { error: 'Invalid input: At least one boolean field required' },
        { status: 400 }
      );
    }

    // Build update data object with only provided fields
    const updateData: any = {};
    if (typeof showWorkoutDetails === 'boolean') updateData.showWorkoutDetails = showWorkoutDetails;
    if (typeof showExerciseNames === 'boolean') updateData.showExerciseNames = showExerciseNames;
    if (typeof showPerformanceTrends === 'boolean')
      updateData.showPerformanceTrends = showPerformanceTrends;
    if (typeof showWorkoutSchedule === 'boolean')
      updateData.showWorkoutSchedule = showWorkoutSchedule;

    // Upsert privacy settings
    const privacySettings = await prisma.privacySettings.upsert({
      where: { userId: auth.userId },
      update: updateData,
      create: {
        userId: auth.userId,
        showWorkoutDetails: showWorkoutDetails ?? true,
        showExerciseNames: showExerciseNames ?? true,
        showPerformanceTrends: showPerformanceTrends ?? true,
        showWorkoutSchedule: showWorkoutSchedule ?? true,
      },
    });

    return NextResponse.json({
      success: true,
      privacySettings,
    });
  } catch (error) {
    console.error('Privacy settings PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update privacy settings' }, { status: 500 });
  }
}
