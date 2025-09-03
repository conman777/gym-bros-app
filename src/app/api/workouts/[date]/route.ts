import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ date: string }> }
) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date } = await context.params
    const startDate = new Date(date)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    const workout = await prisma.workout.findFirst({
      where: {
        userId: userId.value,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        exercises: {
          orderBy: { orderIndex: 'asc' },
          include: {
            sets: {
              orderBy: { orderIndex: 'asc' }
            }
          }
        }
      }
    })

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 })
    }

    return NextResponse.json(workout)
  } catch (error) {
    console.error('Failed to fetch workout:', error)
    return NextResponse.json({ error: 'Failed to fetch workout' }, { status: 500 })
  }
}