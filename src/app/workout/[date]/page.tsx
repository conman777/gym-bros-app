'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, Dumbbell, Trophy, Zap } from 'lucide-react';
import * as Progress from '@radix-ui/react-progress';
import BottomNav from '@/components/BottomNav';

interface Set {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

interface Workout {
  id: string;
  date: string;
  completed: boolean;
  exercises: Exercise[];
}

export default function WorkoutPage({ params }: { params: Promise<{ date: string }> }) {
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => {
    async function fetchWorkout() {
      const { date } = await params;
      try {
        const response = await fetch(`/api/workouts/${date}`);
        if (response.ok) {
          const data = await response.json();
          setWorkout(data);
        }
      } catch (error) {
        console.error('Failed to fetch workout:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchWorkout();
  }, [params]);

  const toggleSet = async (exerciseId: string, setId: string) => {
    if (!workout || saving) return;

    const exercise = workout.exercises.find((e) => e.id === exerciseId);
    const set = exercise?.sets.find((s) => s.id === setId);
    if (!set) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/sets/${setId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !set.completed }),
      });

      if (response.ok) {
        setWorkout({
          ...workout,
          exercises: workout.exercises.map((e) =>
            e.id === exerciseId
              ? {
                  ...e,
                  sets: e.sets.map((s) => (s.id === setId ? { ...s, completed: !s.completed } : s)),
                }
              : e
          ),
        });
      }
    } catch (error) {
      console.error('Failed to update set:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateWeight = async (exerciseId: string, setId: string, weight: number) => {
    if (!workout || saving) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/sets/${setId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight }),
      });

      if (response.ok) {
        setWorkout({
          ...workout,
          exercises: workout.exercises.map((e) =>
            e.id === exerciseId
              ? {
                  ...e,
                  sets: e.sets.map((s) => (s.id === setId ? { ...s, weight } : s)),
                }
              : e
          ),
        });
      }
    } catch (error) {
      console.error('Failed to update weight:', error);
    } finally {
      setSaving(false);
    }
  };

  const finishWorkout = async () => {
    if (!workout || saving) return;

    setShowCompletion(true);
    setSaving(true);

    try {
      const response = await fetch(`/api/workouts/complete/${workout.id}`, {
        method: 'POST',
      });

      if (response.ok) {
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to complete workout:', error);
      setShowCompletion(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Dumbbell className="w-8 h-8 text-[var(--primary)]" />
        </motion.div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Dumbbell className="w-16 h-16 text-[var(--foreground-muted)] mx-auto mb-4" />
          <p className="text-[var(--foreground-muted)] mb-4">No workout found for this date</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-[var(--primary)] hover:text-[var(--primary-dark)]"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  const totalSets = workout.exercises.reduce((acc, e) => acc + e.sets.length, 0);
  const completedSets = workout.exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.completed).length,
    0
  );
  const progressPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  const completedExercises = workout.exercises.filter((e) =>
    e.sets.every((s) => s.completed)
  ).length;

  return (
    <>
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white dark:bg-[var(--surface)] rounded-3xl p-8 text-center"
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                <Trophy className="w-24 h-24 text-[var(--accent)] mx-auto mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Workout Complete! 🎉</h2>
              <p className="text-[var(--foreground-muted)]">Great job finishing your workout!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-[var(--background)] pb-20">
        {/* Header */}
        <header className="bg-[var(--surface)] shadow-sm sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center gap-4 mb-4">
              <Link
                href="/dashboard"
                className="p-2 -ml-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div className="text-center">
                <h1 className="text-xl font-bold">
                  Today's Workout{' '}
                  <span className="text-sm text-[var(--foreground-muted)] font-normal">
                    •{' '}
                    {new Date(workout.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </h1>
              </div>
              <div />
            </div>

            {/* Progress bar */}
            <Progress.Root
              className="relative overflow-hidden bg-[var(--border)] rounded-full w-full h-2"
              value={progressPercentage}
            >
              <Progress.Indicator
                className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] w-full h-full transition-transform duration-500 ease-out rounded-full"
                style={{ transform: `translateX(-${100 - progressPercentage}%)` }}
              />
            </Progress.Root>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-[var(--foreground-muted)]">{completedSets} done</span>
              <span className="font-semibold text-[var(--primary)]">
                {Math.round(progressPercentage)}%
              </span>
              <span className="text-[var(--foreground-muted)]">{totalSets} total</span>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          {/* All Exercises */}
          <div className="space-y-6 mb-6">
            {workout.exercises.map((exercise, exerciseIndex) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: exerciseIndex * 0.1 }}
                className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{exercise.name}</h3>
                  {exercise.sets.every((s) => s.completed) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-[var(--secondary)] text-white p-2 rounded-full"
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={set.id}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: exerciseIndex * 0.1 + setIndex * 0.05 }}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                          set.completed
                            ? 'bg-[var(--secondary)]/10 border border-[var(--secondary)]'
                            : 'bg-[var(--background)] border border-transparent hover:border-[var(--border)]'
                        }`}
                      >
                        <button
                          onClick={() => toggleSet(exercise.id, set.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            set.completed
                              ? 'bg-[var(--secondary)] text-white'
                              : 'bg-[var(--border)] hover:bg-[var(--primary)] hover:text-white'
                          }`}
                          disabled={saving}
                        >
                          {set.completed ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring' }}
                            >
                              <Check className="w-4 h-4" />
                            </motion.div>
                          ) : (
                            <span className="text-sm font-bold">{setIndex + 1}</span>
                          )}
                        </button>

                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                value={set.weight}
                                onChange={(e) =>
                                  updateWeight(exercise.id, set.id, parseFloat(e.target.value) || 0)
                                }
                                className="w-24 px-3 py-1.5 bg-white dark:bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                step="0.5"
                                disabled={saving}
                              />
                              <span className="text-[var(--foreground-muted)] font-medium">kg</span>
                            </div>
                            <span className="text-[var(--foreground-muted)]">×</span>
                            <span className="font-semibold">{set.reps} reps</span>
                          </div>
                        </div>

                        <AnimatePresence>
                          {set.completed && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                            >
                              <Zap className="w-5 h-5 text-[var(--accent)]" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Quick weight presets - Mobile optimized */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: exerciseIndex * 0.1 + setIndex * 0.05 + 0.1 }}
                        className="flex flex-wrap gap-2 mt-2 pl-12 pr-4"
                      >
                        {/* Absolute weight presets */}
                        <div className="flex flex-wrap gap-2">
                          {[20, 40, 60, 80].map((weight) => (
                            <button
                              key={weight}
                              onClick={() => updateWeight(exercise.id, set.id, weight)}
                              className="min-w-[44px] px-3 py-2 bg-[var(--surface)] active:bg-[var(--primary)] active:text-white hover:bg-[var(--primary)] hover:text-white border border-[var(--border)] rounded-lg text-sm font-medium transition-colors touch-manipulation"
                              disabled={saving}
                            >
                              {weight}
                            </button>
                          ))}
                        </div>
                        <div className="w-px bg-[var(--border)] mx-1 hidden sm:block" />
                        {/* Increment presets */}
                        <div className="flex gap-2">
                          {[-2.5, 2.5, 5].map((increment) => (
                            <button
                              key={increment}
                              onClick={() =>
                                updateWeight(
                                  exercise.id,
                                  set.id,
                                  Math.max(0, set.weight + increment)
                                )
                              }
                              className="min-w-[44px] px-3 py-2 bg-[var(--surface)] active:bg-[var(--primary)] active:text-white hover:bg-[var(--primary)] hover:text-white border border-[var(--border)] rounded-lg text-sm font-medium transition-colors touch-manipulation"
                              disabled={saving}
                            >
                              {increment > 0 ? '+' : ''}
                              {increment}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)]"
            >
              <div className="flex items-center justify-between mb-2">
                <Dumbbell className="w-5 h-5 text-[var(--primary)]" />
                <span className="text-2xl font-bold">
                  {completedExercises}/{workout.exercises.length}
                </span>
              </div>
              <p className="text-sm text-[var(--foreground-muted)]">Exercises done</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)]"
            >
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-5 h-5 text-[var(--accent)]" />
                <span className="text-2xl font-bold">{completedSets}</span>
              </div>
              <p className="text-sm text-[var(--foreground-muted)]">Sets completed</p>
            </motion.div>
          </div>

          {/* Finish Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={finishWorkout}
            disabled={saving || completedSets === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              completedSets === totalSets
                ? 'bg-gradient-to-r from-[var(--secondary)] to-[var(--secondary-dark)] text-white shadow-lg'
                : completedSets > 0
                  ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                  : 'bg-[var(--border)] text-[var(--foreground-muted)] cursor-not-allowed'
            }`}
          >
            {completedSets === totalSets
              ? 'Complete Workout 🎉'
              : completedSets > 0
                ? 'Finish Early'
                : 'Complete some sets first'}
          </motion.button>
        </main>

        <BottomNav />
      </div>
    </>
  );
}
