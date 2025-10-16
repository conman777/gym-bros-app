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

    const set = await prisma.set.findUnique({
      where: { id },
      include: {
        exercise: {
          include: {
            sets: true,
            workout: true
          }
        }
      }
    })

    if (!set || set.exercise.workout.userId !== userId.value) {
      return NextResponse.json({ error: 'Set not found' }, { status: 404 })
    }

    const previousCompleted = set.completed
    const newCompleted = body.completed ?? set.completed

    const updatedSet = await prisma.set.update({
      where: { id },
      data: {
        completed: newCompleted,
        weight: body.weight !== undefined ? body.weight : set.weight,
      }
    })

    let setsDelta = 0
    let exercisesDelta = 0

    if (previousCompleted !== newCompleted) {
      setsDelta = newCompleted ? 1 : -1

      const otherSets = set.exercise.sets.filter((s) => s.id !== id)
      const exerciseWasComplete = previousCompleted && otherSets.every((s) => s.completed)
      const exerciseIsComplete = newCompleted && otherSets.every((s) => s.completed)

      if (!exerciseWasComplete && exerciseIsComplete) {
        exercisesDelta = 1
      } else if (exerciseWasComplete && !exerciseIsComplete) {
        exercisesDelta = -1
      }
    }

    if (setsDelta !== 0 || exercisesDelta !== 0) {
      const stats = await prisma.stats.findUnique({
        where: { userId: userId.value }
      })

      if (stats) {
        const nextTotalSets = Math.max((stats.totalSetsCompleted ?? 0) + setsDelta, 0)
        const nextTotalExercises = Math.max((stats.totalExercises ?? 0) + exercisesDelta, 0)

        const updateData: {
          totalSetsCompleted: number
          totalExercises: number
          lastWorkoutDate?: Date | null
        } = {
          totalSetsCompleted: nextTotalSets,
          totalExercises: nextTotalExercises
        }

        if (setsDelta > 0 && newCompleted) {
          updateData.lastWorkoutDate = new Date()
        }

        await prisma.stats.update({
          where: { userId: userId.value },
          data: updateData
        })
      }
    }

    return NextResponse.json(updatedSet)
  } catch (error) {
    console.error('Failed to update set:', error)
    return NextResponse.json({ error: 'Failed to update set' }, { status: 500 })
  }
}