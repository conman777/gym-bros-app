import type { RehabExercise } from "@/lib/types";

/**
 * Summary of a rehab exercise for API responses
 * Excludes internal fields like userId, timestamps
 */
export interface ExerciseSummary {
  id: string;
  name: string;
  completed: boolean;
  setsLeft: number | null;
  setsRight: number | null;
  sets: number | null;
  reps: number | null;
  hold: number | null;
  load: string | null;
  bandColor: string | null;
  time: string | null;
}

/**
 * Exercises grouped by category
 */
export type ExercisesByCategory = Record<string, ExerciseSummary[]>;

/**
 * Group rehab exercises by category
 * Used for diagnostic endpoints and reports
 */
export function groupExercisesByCategory(
  exercises: RehabExercise[]
): ExercisesByCategory {
  return exercises.reduce((acc, ex) => {
    const category = ex.category || "Uncategorized";

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push({
      id: ex.id,
      name: ex.name,
      completed: ex.completed,
      setsLeft: ex.setsLeft,
      setsRight: ex.setsRight,
      sets: ex.sets,
      reps: ex.reps,
      hold: ex.hold,
      load: ex.load,
      bandColor: ex.bandColor,
      time: ex.time,
    });

    return acc;
  }, {} as ExercisesByCategory);
}
