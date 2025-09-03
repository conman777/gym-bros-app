import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createDemoWorkouts } from '@/lib/demo-data'

export async function POST(request: NextRequest) {
  try {
    const { userName } = await request.json()
    
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
      await createDemoWorkouts(user.id)
    }

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
  }
}