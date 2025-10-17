import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const exercises = await prisma.rehabExercise.findMany({
      where: { userId },
      orderBy: { orderIndex: 'asc' },
    })

    return NextResponse.json(exercises)
  } catch (error) {
    console.error('Error fetching rehab exercises:', error)
    return NextResponse.json({ error: 'Failed to fetch rehab exercises' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const existingExercises = await prisma.rehabExercise.findMany({
      where: { userId },
      orderBy: { orderIndex: 'desc' },
      take: 1,
    })

    const orderIndex = existingExercises.length > 0 ? existingExercises[0].orderIndex + 1 : 0

    const exercise = await prisma.rehabExercise.create({
      data: {
        userId,
        name,
        description: description || null,
        orderIndex,
      },
    })

    return NextResponse.json(exercise, { status: 201 })
  } catch (error) {
    console.error('Error creating rehab exercise:', error)
    return NextResponse.json({ error: 'Failed to create rehab exercise' }, { status: 500 })
  }
}
