import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId.value },
    include: {
      stats: true,
      workouts: {
        where: { completed: true },
        orderBy: { date: 'desc' }
      }
    }
  })

  if (!user) {
    // User cookie exists but user not found in DB - clear the invalid cookie
    const response = NextResponse.json({ error: 'User not found' }, { status: 404 })
    response.cookies.delete('userId')
    return response
  }

  // Get this month's stats
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const monthlyWorkouts = await prisma.workout.findMany({
    where: {
      userId: userId.value,
      completed: true,
      date: { gte: startOfMonth }
    },
    include: {
      exercises: {
        include: {
          sets: {
            where: { completed: true }
          }
        }
      }
    }
  })

  const monthlySets = monthlyWorkouts.reduce(
    (acc, workout) => acc + workout.exercises.reduce(
      (sum, exercise) => sum + exercise.sets.length, 0
    ), 0
  )

  // Calculate most done exercise
  const exerciseCounts = new Map<string, number>()
  const allWorkouts = await prisma.workout.findMany({
    where: { userId: userId.value, completed: true },
    include: {
      exercises: {
        include: {
          sets: { where: { completed: true } }
        }
      }
    }
  })

  allWorkouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const count = exerciseCounts.get(exercise.name) || 0
      exerciseCounts.set(exercise.name, count + exercise.sets.length)
    })
  })

  const topExercise = Array.from(exerciseCounts.entries())
    .sort((a, b) => b[1] - a[1])[0] || null

  // Calculate current streak
  let currentStreak = 0
  const sortedWorkouts = user.workouts || []
  
  if (sortedWorkouts.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      
      const hasWorkout = sortedWorkouts.some(w => {
        const workoutDate = new Date(w.date)
        workoutDate.setHours(0, 0, 0, 0)
        return workoutDate.getTime() === checkDate.getTime()
      })
      
      if (hasWorkout) {
        currentStreak++
      } else if (i > 0) {
        break
      }
    }
  }

  return NextResponse.json({
    user,
    monthlySets,
    topExercise,
    currentStreak
  })
}