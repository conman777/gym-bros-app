'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Dumbbell } from 'lucide-react';
import { formatDateForUrl } from '@/lib/date-utils';
import { PageNav } from '@/components/PageNav';
import BottomNav from '@/components/BottomNav';

interface WorkoutDay {
  id: string;
  date: Date;
  completed: boolean;
  exercises: Array<{
    id: string;
    name: string;
    sets: Array<{ id: string }>;
  }>;
}

function CalendarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [workouts, setWorkouts] = useState<WorkoutDay[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const monthParam = searchParams?.get('month');
  const yearParam = searchParams?.get('year');
  const [month, setMonth] = useState(monthParam ? parseInt(monthParam) : now.getMonth());
  const [year, setYear] = useState(yearParam ? parseInt(yearParam) : now.getFullYear());

  useEffect(() => {
    fetchWorkouts();
  }, [month, year]);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch(`/api/calendar?month=${month}&year=${year}`);
      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch workouts');
      }

      const data = await response.json();
      setWorkouts(
        data.workouts.map((w: any) => ({
          ...w,
          date: new Date(w.date),
        }))
      );
    } catch (error) {
      console.error('Calendar error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Memoize workout map to avoid recreating on every render
  const workoutMap = useMemo(() => {
    const map = new Map<string, WorkoutDay>();
    workouts.forEach((workout) => {
      const dateKey = `${year}-${month}-${workout.date.getDate()}`;
      map.set(dateKey, workout);
    });
    return map;
  }, [workouts, year, month]);

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (month === 0) {
        setMonth(11);
        setYear(year - 1);
      } else {
        setMonth(month - 1);
      }
    } else {
      if (month === 11) {
        setMonth(0);
        setYear(year + 1);
      } else {
        setMonth(month + 1);
      }
    }

    const newMonth =
      direction === 'prev' ? (month === 0 ? 11 : month - 1) : month === 11 ? 0 : month + 1;
    const newYear =
      direction === 'prev' ? (month === 0 ? year - 1 : year) : month === 11 ? year + 1 : year;

    router.push(`/calendar?month=${newMonth}&year=${newYear}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <CalendarIcon className="w-8 h-8 text-white" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-6 overflow-hidden relative">
      {/* Header */}
      <header className="bg-gray-500/[0.02] backdrop-blur-[4.6px] border-b border-white/20 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </Link>
            <motion.div
              key={`${month}-${year}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-xl font-bold text-white">
                {monthNames[month]} {year}
              </h1>
            </motion.div>
            <div className="hidden md:flex">
              <PageNav />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateMonth('prev')}
            className="p-3 rounded-xl bg-gray-500/[0.02] backdrop-blur-[4.6px] hover:bg-white/20 transition-colors shadow-lg border border-white/20"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              const today = new Date();
              setMonth(today.getMonth());
              setYear(today.getFullYear());
              router.push('/calendar');
            }}
            className="px-6 py-2 bg-white text-[var(--primary)] rounded-xl font-medium hover:bg-white/90 transition-colors shadow-lg"
          >
            Today
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateMonth('next')}
            className="p-3 rounded-xl bg-gray-500/[0.02] backdrop-blur-[4.6px] hover:bg-white/20 transition-colors shadow-lg border border-white/20"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-500/[0.02] backdrop-blur-[4.6px] rounded-2xl shadow-lg border border-white/20 p-4"
        >
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center py-2">
                <span className="text-sm font-semibold text-white/85">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for first week */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {/* Days of month */}
            <AnimatePresence mode="popLayout">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dateKey = `${year}-${month}-${day}`;
                const workout = workoutMap.get(dateKey);
                const isToday =
                  year === now.getFullYear() && month === now.getMonth() && day === now.getDate();
                const isCompleted = workout?.completed;
                const hasSets = workout?.exercises.some((e) => e.sets.length > 0);
                const isPast =
                  new Date(year, month, day) <
                  new Date(now.getFullYear(), now.getMonth(), now.getDate());

                return (
                  <motion.div
                    key={`${year}-${month}-${day}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: day * 0.01 }}
                  >
                    {workout && hasSets ? (
                      <Link href={`/workout/${formatDateForUrl(workout.date)}`} className="block">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`aspect-square rounded-xl p-2 flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                            isToday ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''
                          } ${
                            isCompleted
                              ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-md'
                              : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                          }`}
                        >
                          <span className="font-semibold text-lg">{day}</span>
                          <div className="text-xs mt-1">
                            {isCompleted ? (
                              <Check className="w-4 h-4 mx-auto" />
                            ) : (
                              <span className="flex items-center gap-1">
                                <Dumbbell className="w-3 h-3" />
                                {workout.exercises.length}
                              </span>
                            )}
                          </div>
                          {isToday && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse shadow-lg" />
                          )}
                        </motion.div>
                      </Link>
                    ) : (
                      <div
                        className={`aspect-square rounded-xl p-2 flex items-center justify-center transition-colors ${
                          isToday
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent bg-white/10'
                            : isPast
                              ? 'bg-transparent text-white/30'
                              : 'bg-transparent hover:bg-white/10 text-white/85'
                        }`}
                      >
                        <span className={`font-semibold text-lg ${isPast ? '' : ''}`}>{day}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white/20" />
              <span className="text-sm text-white/85">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-emerald-500" />
              <span className="text-sm text-white/85">Completed</span>
            </div>
          </div>
        </motion.div>

        {/* Monthly Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-gray-500/[0.02] backdrop-blur-[4.6px] rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h3 className="font-semibold text-white mb-4">Month Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold text-white">
                {workouts.filter((w) => w.completed).length}
              </p>
              <p className="text-sm text-white/85">Workouts completed</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">
                {workouts.filter((w) => w.exercises.some((e) => e.sets.length > 0)).length}
              </p>
              <p className="text-sm text-white/85">Total scheduled</p>
            </div>
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <CalendarIcon className="w-8 h-8 text-white" />
          </motion.div>
        </div>
      }
    >
      <CalendarContent />
    </Suspense>
  );
}
