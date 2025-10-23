/**
 * Helper functions for stats calculations
 * Extracted to enable unit testing and improve maintainability
 */

export interface StatsUpdate {
  setsDelta: number;
  exercisesDelta: number;
}

/**
 * Calculate stats deltas when a set's completion status changes
 * @param previousCompleted - Was the set previously completed?
 * @param newCompleted - Is the set now completed?
 * @param otherSetsCompleted - Are all other sets in the exercise completed?
 * @returns Stats deltas to apply
 */
export function calculateStatsDeltas(
  previousCompleted: boolean,
  newCompleted: boolean,
  otherSetsCompleted: boolean
): StatsUpdate {
  // No change in completion status
  if (previousCompleted === newCompleted) {
    return { setsDelta: 0, exercisesDelta: 0 };
  }

  const setsDelta = newCompleted ? 1 : -1;

  // Determine if exercise completion status changed
  const exerciseWasComplete = previousCompleted && otherSetsCompleted;
  const exerciseIsComplete = newCompleted && otherSetsCompleted;

  let exercisesDelta = 0;
  if (!exerciseWasComplete && exerciseIsComplete) {
    exercisesDelta = 1;
  } else if (exerciseWasComplete && !exerciseIsComplete) {
    exercisesDelta = -1;
  }

  return { setsDelta, exercisesDelta };
}

/**
 * Apply stats deltas to current stats values
 * Ensures values never go below zero
 */
export function applyStatsDeltas(
  currentSets: number,
  currentExercises: number,
  deltas: StatsUpdate
): { totalSets: number; totalExercises: number } {
  return {
    totalSets: Math.max(currentSets + deltas.setsDelta, 0),
    totalExercises: Math.max(currentExercises + deltas.exercisesDelta, 0),
  };
}
