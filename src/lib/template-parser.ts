import type { WorkoutTemplate } from './types';

export function parseWorkoutTemplate(text: string): WorkoutTemplate[] {
  const lines = text.trim().split('\n');
  const workouts: WorkoutTemplate[] = [];
  let currentWorkout: WorkoutTemplate | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) continue;

    // Check if it's a day header (e.g., "Monday - Chest & Triceps")
    if (trimmedLine.match(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i)) {
      if (currentWorkout) {
        workouts.push(currentWorkout);
      }
      currentWorkout = {
        day: trimmedLine,
        exercises: [],
      };
    } else if (currentWorkout) {
      // Parse exercise line (e.g., "Bench Press: 3x10 @ 135lbs")
      const exerciseMatch = trimmedLine.match(
        /^(.+?):\s*(\d+)x(\d+)\s*(?:@\s*(\d+(?:\.\d+)?)\s*(?:lbs?|kg)?)?/i
      );

      if (exerciseMatch) {
        const [, name, sets, reps, weight] = exerciseMatch;
        currentWorkout.exercises.push({
          name: name.trim(),
          sets: parseInt(sets),
          reps: parseInt(reps),
          weight: weight ? parseFloat(weight) : 0,
        });
      }
    }
  }

  if (currentWorkout) {
    workouts.push(currentWorkout);
  }

  return workouts;
}
