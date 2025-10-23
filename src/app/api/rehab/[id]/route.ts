import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { updateRehabExerciseSchema } from '@/lib/validation-schemas';
import { handleApiError, ApiErrors } from '@/lib/api-errors';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      throw ApiErrors.Unauthorized;
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateRehabExerciseSchema.parse(body);

    const exercise = await prisma.rehabExercise.findUnique({
      where: { id },
    });

    if (!exercise || exercise.userId !== userId) {
      throw ApiErrors.NotFound;
    }

    const updateData: {
      name?: string;
      category?: string;
      sets?: number;
      reps?: number;
      holdTime?: number;
      resistanceBand?: string;
      weight?: number;
      side?: string;
      notes?: string;
      completed?: boolean;
      completedDate?: Date | null;
    } = { ...validatedData };

    if (validatedData.completed !== undefined) {
      updateData.completed = validatedData.completed;
      updateData.completedDate = validatedData.completed ? new Date() : null;
    }

    const updated = await prisma.rehabExercise.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error, 'Failed to update rehab exercise');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      throw ApiErrors.Unauthorized;
    }

    const { id } = await params;

    const exercise = await prisma.rehabExercise.findUnique({
      where: { id },
    });

    if (!exercise || exercise.userId !== userId) {
      throw ApiErrors.NotFound;
    }

    await prisma.rehabExercise.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, 'Failed to delete rehab exercise');
  }
}
