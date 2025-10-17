import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createDemoWorkouts, createRehabExercises } from '@/lib/demo-data'
import type { UserName } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { userName } = await request.json() as { userName?: UserName }
    
    if (!userName || (userName !== 'Conor' && userName !== 'Devlin')) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { name: userName },
      include: {
        workouts: {
          take: 1
        }
      }
    })

    let isNewUser = false

    if (!user) {
      user = await prisma.user.create({
        data: { 
          name: userName,
          stats: {
            create: {}
          }
        }
      })
      isNewUser = true
    } else if (user.workouts.length === 0) {
      // Existing user but no workouts
      isNewUser = true
    }

    // Create demo workouts for new users
    if (isNewUser) {
      await createDemoWorkouts(user.id, userName)

      // Create rehab exercises for Devlin
      if (userName === 'Devlin') {
        await createRehabExercises(user.id)
      }
    }

    // Set cookie
    const response = NextResponse.json({ success: true, userId: user.id })
    response.cookies.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
    return response
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
  }
}