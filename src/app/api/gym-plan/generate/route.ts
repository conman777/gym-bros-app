import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { generateGymPlan } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const auth = await getUserFromCookies();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fitnessGoal, fitnessLevel, daysPerWeek, equipmentAccess } = body;

    if (!fitnessGoal || !fitnessLevel || !daysPerWeek || !equipmentAccess) {
      return NextResponse.json(
        {
          error: 'Missing required fields: fitnessGoal, fitnessLevel, daysPerWeek, equipmentAccess',
        },
        { status: 400 }
      );
    }

    if (typeof daysPerWeek !== 'number' || daysPerWeek < 1 || daysPerWeek > 7) {
      return NextResponse.json(
        { error: 'daysPerWeek must be a number between 1 and 7' },
        { status: 400 }
      );
    }

    const validGoals = ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'general_fitness'];
    if (!validGoals.includes(fitnessGoal)) {
      return NextResponse.json(
        { error: `fitnessGoal must be one of: ${validGoals.join(', ')}` },
        { status: 400 }
      );
    }

    const validLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validLevels.includes(fitnessLevel)) {
      return NextResponse.json(
        { error: `fitnessLevel must be one of: ${validLevels.join(', ')}` },
        { status: 400 }
      );
    }

    const validEquipment = ['gym', 'home', 'bodyweight'];
    if (!validEquipment.includes(equipmentAccess)) {
      return NextResponse.json(
        { error: `equipmentAccess must be one of: ${validEquipment.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('Generating gym plan for user:', auth.userId);

    // Archive any existing active plans before creating a new one
    await prisma.gymPlan.updateMany({
      where: {
        userId: auth.userId,
        status: 'active',
      },
      data: {
        status: 'archived',
      },
    });

    const aiResponse = await generateGymPlan({
      fitnessGoal,
      fitnessLevel,
      daysPerWeek,
      equipmentAccess,
    });

    const gymPlan = await prisma.gymPlan.create({
      data: {
        userId: auth.userId,
        fitnessGoal,
        fitnessLevel,
        daysPerWeek,
        equipmentAccess,
        planContent: aiResponse.planContent as any,
        weeklySchedule: aiResponse.weeklySchedule as any,
        status: 'active',
      },
    });

    await prisma.activityLog.create({
      data: {
        category: 'GYM_PLAN',
        operation: 'generate_plan',
        message: `User ${auth.userId} generated a ${daysPerWeek}-day ${fitnessGoal} plan`,
        status: 'SUCCESS',
        details: {
          gymPlanId: gymPlan.id,
          fitnessGoal,
          fitnessLevel,
          daysPerWeek,
          equipmentAccess,
        },
      },
    });

    return NextResponse.json(gymPlan, { status: 201 });
  } catch (error) {
    console.error('Error generating gym plan:', error);

    await prisma.activityLog.create({
      data: {
        category: 'GYM_PLAN',
        operation: 'generate_plan',
        message: 'Failed to generate gym plan',
        status: 'ERROR',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
    });

    return NextResponse.json(
      {
        error: 'Failed to generate gym plan',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
