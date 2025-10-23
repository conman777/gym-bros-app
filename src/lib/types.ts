export type Brand<K, T> = K & { __brand: T };

export type UserId = Brand<string, 'UserId'>;
export type WorkoutId = Brand<string, 'WorkoutId'>;
export type ExerciseId = Brand<string, 'ExerciseId'>;
export type SetId = Brand<string, 'SetId'>;
export type RehabExerciseId = Brand<string, 'RehabExerciseId'>;
export type HabitLogId = Brand<string, 'HabitLogId'>;

export type UserName = 'Conor' | 'Devlin';

export interface WorkoutTemplate {
  day: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight: number;
  }[];
}

export interface RehabExercise {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  setsLeft: number | null;
  setsRight: number | null;
  sets: number | null;
  reps: number | null;
  hold: number | null;
  load: string | null;
  bandColor: string | null;
  time: string | null;
  cues: string | null;
  completed: boolean;
  completedDate: Date | null;
  orderIndex: number;
}

export type HabitType = 'SMOKING' | 'NICOTINE_POUCH';

export interface HabitLog {
  id: string;
  userId: string;
  type: HabitType;
  timestamp: Date;
}

export interface HabitCounts {
  smoking: number;
  nicotinePouches: number;
}

export interface HabitStats {
  today: HabitCounts;
  thisWeek: HabitCounts;
}
