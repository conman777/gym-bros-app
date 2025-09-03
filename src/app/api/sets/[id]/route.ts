import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    // Verify the set belongs to the user
    const set = await prisma.set.findUnique({
      where: { id },
      include: {
        exercise: {
          include: {
            workout: true
          }
        }
      }
    })

    if (!set || set.exercise.workout.userId !== userId.value) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 })
    }

    // Update the set
    const updatedSet = await prisma.set.update({
      where: { id },
      data: {
        completed: body.completed !== undefined ? body.completed : set.completed,
        weight: body.weight !== undefined ? body.weight : set.weight,
      }
    })

    // Update stats if completing a set
    if (body.completed === true && !set.completed) {
      await prisma.stats.update({
        where: { userId: userId.value },
        data: {
          totalSetsCompleted: { increment: 1 },
          totalExercises: { increment: 1 }
        }
      })
    } else if (body.completed === false && set.completed) {
      await prisma.stats.update({
        where: { userId: userId.value },
        data: {
          totalSetsCompleted: { decrement: 1 },
          totalExercises: { decrement: 1 }
        }
      })
    }

    return NextResponse.json(updatedSet)
  } catch (error) {
    console.error('Failed to update set:', error)
    return NextResponse.json({ error: 'Failed to update set' }, { status: 500 })
  }
}