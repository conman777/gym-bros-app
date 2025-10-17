import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const exercise = await prisma.rehabExercise.findUnique({
      where: { id },
    })

    if (!exercise || exercise.userId !== userId) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    const updateData: {
      name?: string
      description?: string | null
      completed?: boolean
      completedDate?: Date | null
      orderIndex?: number
    } = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.orderIndex !== undefined) updateData.orderIndex = body.orderIndex

    if (body.completed !== undefined) {
      updateData.completed = body.completed
      updateData.completedDate = body.completed ? new Date() : null
    }

    const updated = await prisma.rehabExercise.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating rehab exercise:', error)
    return NextResponse.json({ error: 'Failed to update rehab exercise' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const exercise = await prisma.rehabExercise.findUnique({
      where: { id },
    })

    if (!exercise || exercise.userId !== userId) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    await prisma.rehabExercise.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting rehab exercise:', error)
    return NextResponse.json({ error: 'Failed to delete rehab exercise' }, { status: 500 })
  }
}
