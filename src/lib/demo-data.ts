import { prisma } from '@/lib/prisma'

const DEMO_WORKOUTS = {
  monday: {
    name: 'Upper Body',
    exercises: [
      { name: 'Bench Press', sets: 3, reps: 10, weight: 43 },
      { name: 'Dumbbell Rows', sets: 3, reps: 10, weight: 14 },
      { name: 'Overhead Press', sets: 3, reps: 8, weight: 30 },
      { name: 'Bicep Curls', sets: 3, reps: 12, weight: 9 },
      { name: 'Tricep Extensions', sets: 3, reps: 12, weight: 7 }
    ]
  },
  wednesday: {
    name: 'Lower Body',
    exercises: [
      { name: 'Squats', sets: 3, reps: 10, weight: 43 },
      { name: 'Walking Lunges', sets: 3, reps: 10, weight: 0 },
      { name: 'Leg Press', sets: 3, reps: 12, weight: 82 },
      { name: 'Calf Raises', sets: 3, reps: 15, weight: 45 },
      { name: 'Leg Curls', sets: 3, reps: 12, weight: 23 }
    ]
  },
  friday: {
    name: 'Full Body',
    exercises: [
      { name: 'Deadlifts', sets: 3, reps: 5, weight: 61 },
      { name: 'Pull-ups', sets: 3, reps: 5, weight: 0 },
      { name: 'Dumbbell Press', sets: 3, reps: 10, weight: 18 },
      { name: 'Plank', sets: 3, reps: 30, weight: 0 },
      { name: 'Face Pulls', sets: 3, reps: 15, weight: 9 }
    ]
  }
}

export async function createDemoWorkouts(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Create workouts for the past week (some completed) and next week
  const workoutsToCreate = []
  
  // Past workouts (last week - some completed)
  for (let daysAgo = 7; daysAgo >= 1; daysAgo--) {
    const date = new Date(today)
    date.setDate(date.getDate() - daysAgo)
    const dayOfWeek = date.getDay()
    
    let workout = null
    let completed = false
    let completionRate = 0
    
    if (dayOfWeek === 1) { // Monday
      workout = DEMO_WORKOUTS.monday
      completed = daysAgo > 2
      completionRate = completed ? 0.8 : 0
    } else if (dayOfWeek === 3) { // Wednesday
      workout = DEMO_WORKOUTS.wednesday
      completed = daysAgo > 4
      completionRate = completed ? 0.9 : 0
    } else if (dayOfWeek === 5) { // Friday
      workout = DEMO_WORKOUTS.friday
      completed = daysAgo > 6
      completionRate = completed ? 0.7 : 0
    }
    
    if (workout) {
      workoutsToCreate.push({
        date,
        workout,
        completed,
        completionRate
      })
    }
  }
  
  // Current and future workouts (this week and next week)
  for (let daysAhead = 0; daysAhead <= 14; daysAhead++) {
    const date = new Date(today)
    date.setDate(date.getDate() + daysAhead)
    const dayOfWeek = date.getDay()
    
    let workout = null
    
    if (dayOfWeek === 1) { // Monday
      workout = DEMO_WORKOUTS.monday
    } else if (dayOfWeek === 3) { // Wednesday
      workout = DEMO_WORKOUTS.wednesday
    } else if (dayOfWeek === 5) { // Friday
      workout = DEMO_WORKOUTS.friday
    }
    
    if (workout) {
      workoutsToCreate.push({
        date,
        workout,
        completed: false,
        completionRate: 0
      })
    }
  }
  
  // Create all workouts in the database
  let totalSetsCompleted = 0
  let totalExercisesCompleted = 0
  
  for (const { date, workout, completed, completionRate } of workoutsToCreate) {
    const createdWorkout = await prisma.workout.create({
      data: {
        userId,
        date,
        completed,
        exercises: {
          create: workout.exercises.map((exercise, index) => ({
            name: exercise.name,
            orderIndex: index,
            sets: {
              create: Array.from({ length: exercise.sets }, (_, setIndex) => {
                const isCompleted = completed && Math.random() < completionRate
                if (isCompleted) {
                  totalSetsCompleted++
                  totalExercisesCompleted++
                }
                return {
                  reps: exercise.reps,
                  weight: exercise.weight,
                  orderIndex: setIndex,
                  completed: isCompleted
                }
              })
            }
          }))
        }
      }
    })
  }
  
  // Update user stats with the completed sets
  if (totalSetsCompleted > 0) {
    await prisma.stats.update({
      where: { userId },
      data: {
        totalSetsCompleted,
        totalExercises: totalExercisesCompleted,
        lastWorkoutDate: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    })
  }
  
  return workoutsToCreate.length
}