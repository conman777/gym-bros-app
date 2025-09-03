export type Brand<K, T> = K & { __brand: T }

export type UserId = Brand<string, 'UserId'>
export type WorkoutId = Brand<string, 'WorkoutId'>
export type ExerciseId = Brand<string, 'ExerciseId'>
export type SetId = Brand<string, 'SetId'>

export type UserName = 'Conor' | 'Devlin'

export interface WorkoutTemplate {
  day: string
  exercises: {
    name: string
    sets: number
    reps: number
    weight: number
  }[]
}