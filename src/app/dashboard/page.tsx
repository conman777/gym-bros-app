'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDateForUrl } from '@/lib/date-utils'
import BottomNav from '@/components/BottomNav'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Dumbbell, Flame, Trophy, LogOut, Calendar, TrendingUp, Heart, Settings, FileText, Info } from 'lucide-react'
import * as Progress from '@radix-ui/react-progress'
import type { RehabExercise } from '@/lib/types'

interface User {
  id: string
  name: string
  stats: {
    totalSetsCompleted: number
    totalExercises: number
  } | null
}

interface Workout {
  id: string
  date: Date
  exercises: {
    id: string
    name: string
    sets: {
      id: string
      completed: boolean
    }[]
  }[]
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [todayWorkout, setTodayWorkout] = useState<Workout | null>(null)
  const [rehabExercises, setRehabExercises] = useState<RehabExercise[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          router.push('/')
          return
        }
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setUser(data.user)
      setTodayWorkout(data.todayWorkout)

      if (data.user?.name === 'Devlin') {
        const rehabResponse = await fetch('/api/rehab')
        if (rehabResponse.ok) {
          const rehabData = await rehabResponse.json()
          setRehabExercises(rehabData)
        }
      }
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRehabExercise = async (exerciseId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/rehab/${exerciseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })

      if (response.ok) {
        setRehabExercises(exercises =>
          exercises.map(ex =>
            ex.id === exerciseId
              ? { ...ex, completed, completedDate: completed ? new Date() : null }
              : ex
          )
        )
      }
    } catch (error) {
      console.error('Failed to toggle rehab exercise:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Dumbbell className="w-8 h-8 text-[var(--primary)]" />
        </motion.div>
      </div>
    )
  }

  if (!user) return null

  const totalSetsToday = todayWorkout?.exercises.reduce(
    (acc, exercise) => acc + exercise.sets.length, 0
  ) || 0
  const completedSetsToday = todayWorkout?.exercises.reduce(
    (acc, exercise) => acc + exercise.sets.filter(set => set.completed).length, 0
  ) || 0
  const progressPercentage = totalSetsToday > 0 ? (completedSetsToday / totalSetsToday) * 100 : 0

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {/* Header */}
      <header className="bg-[var(--surface)] shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">
                Hey, {user.name}! 💪
              </h1>
              <p className="text-sm text-[var(--foreground-muted)]">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              aria-label="Switch user"
            >
              <LogOut className="w-5 h-5 text-[var(--foreground-muted)]" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <AnimatePresence mode="wait">
          {todayWorkout ? (
            <motion.div
              key="workout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-2xl p-6 text-white shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold mb-1">Today's Workout</h2>
                  <p className="opacity-90">
                    {todayWorkout.exercises.length} exercises ready
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{completedSetsToday}/{totalSetsToday}</div>
                  <div className="text-sm opacity-90">sets done</div>
                </div>
              </div>

              <Progress.Root 
                className="relative overflow-hidden bg-white/20 rounded-full w-full h-3 mb-6"
                value={progressPercentage}
              >
                <Progress.Indicator
                  className="bg-white w-full h-full transition-transform duration-500 ease-out rounded-full"
                  style={{ transform: `translateX(-${100 - progressPercentage}%)` }}
                />
              </Progress.Root>

              <div className="space-y-2 mb-6">
                {todayWorkout.exercises.slice(0, 3).map((exercise, index) => (
                  <div key={exercise.id} className="flex items-center text-sm">
                    <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center text-xs
                      ${exercise.sets.every(s => s.completed) 
                        ? 'bg-white text-[var(--primary)]' 
                        : 'bg-white/20'}`}
                    >
                      {exercise.sets.every(s => s.completed) ? '✓' : index + 1}
                    </div>
                    <span className={exercise.sets.every(s => s.completed) ? 'line-through opacity-70' : ''}>
                      {exercise.name}
                    </span>
                    <span className="ml-auto opacity-70">
                      {exercise.sets.filter(s => s.completed).length}/{exercise.sets.length}
                    </span>
                  </div>
                ))}
                {todayWorkout.exercises.length > 3 && (
                  <div className="text-sm opacity-70 pl-8">
                    +{todayWorkout.exercises.length - 3} more exercises
                  </div>
                )}
              </div>

              <Link 
                href={`/workout/${formatDateForUrl(new Date(todayWorkout.date))}`}
                className="flex items-center justify-center w-full bg-white text-[var(--primary)] py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors"
              >
                {completedSetsToday > 0 ? 'Continue Workout' : 'Start Workout'}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="no-workout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--border)]"
            >
              <div className="text-center py-8">
                <Dumbbell className="w-16 h-16 text-[var(--foreground-muted)] mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Workout Today</h2>
                <p className="text-[var(--foreground-muted)] mb-6">
                  Import a workout plan to get started
                </p>
                <Link 
                  href="/import"
                  className="inline-flex items-center bg-[var(--primary)] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[var(--primary-dark)] transition-colors"
                >
                  Import Workout Plan
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--border)]"
          >
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-[var(--accent)]" />
              <span className="text-2xl font-bold">{user.stats?.totalSetsCompleted || 0}</span>
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">Total Sets</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--border)]"
          >
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-8 h-8 text-[var(--danger)]" />
              <span className="text-2xl font-bold">
                {user.stats?.totalSetsCompleted ? Math.floor(user.stats.totalSetsCompleted / 7) : 0}
              </span>
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">Week Streak</p>
          </motion.div>
        </div>

        {/* Rehabilitation Section - Only for Devlin */}
        {user.name === 'Devlin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6" />
                <h3 className="text-xl font-bold">Shoulder Rehabilitation</h3>
              </div>
              <div className="flex gap-2">
                <a
                  href="/shoulder-rehab.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="View PDF"
                >
                  <FileText className="w-5 h-5" />
                </a>
                <Link
                  href="/rehab/manage"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  title="Manage Exercises"
                >
                  <Settings className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {rehabExercises.length === 0 ? (
              <div className="text-center py-6 bg-white/10 rounded-xl">
                <p className="mb-3 opacity-90">No rehab exercises yet</p>
                <Link
                  href="/rehab/manage"
                  className="inline-flex items-center bg-white text-teal-600 px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                >
                  Add Exercises
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex justify-between text-sm opacity-90 mb-2">
                    <span>{rehabExercises.filter(ex => ex.completed).length} completed</span>
                    <span>{rehabExercises.length} total</span>
                  </div>
                  <Progress.Root
                    className="relative overflow-hidden bg-white/20 rounded-full w-full h-2"
                    value={(rehabExercises.filter(ex => ex.completed).length / rehabExercises.length) * 100}
                  >
                    <Progress.Indicator
                      className="bg-white w-full h-full transition-transform duration-500 ease-out rounded-full"
                      style={{
                        transform: `translateX(-${100 - (rehabExercises.filter(ex => ex.completed).length / rehabExercises.length) * 100}%)`
                      }}
                    />
                  </Progress.Root>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {rehabExercises.map((exercise) => {
                    const isExpanded = expandedExercise === exercise.id

                    // Build prescription text
                    const prescription = []
                    if (exercise.setsLeft || exercise.setsRight) {
                      prescription.push(`L: ${exercise.setsLeft || 0} / R: ${exercise.setsRight || 0} sets`)
                    } else if (exercise.sets) {
                      prescription.push(`${exercise.sets} sets`)
                    }
                    if (exercise.reps) prescription.push(`${exercise.reps} reps`)
                    if (exercise.hold) prescription.push(`hold ${exercise.hold}s`)
                    if (exercise.load) prescription.push(exercise.load)
                    if (exercise.bandColor) prescription.push(`${exercise.bandColor} band`)
                    if (exercise.time) prescription.push(exercise.time)

                    return (
                      <motion.div
                        key={exercise.id}
                        whileHover={{ scale: 1.01 }}
                        className="bg-white/10 rounded-lg overflow-hidden"
                      >
                        <div
                          className="flex items-start gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => toggleRehabExercise(exercise.id, !exercise.completed)}
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                              exercise.completed ? 'bg-white' : 'bg-transparent'
                            }`}
                          >
                            {exercise.completed && (
                              <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-4 h-4 text-teal-600"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </motion.svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${exercise.completed ? 'line-through opacity-70' : ''}`}>
                              {exercise.name}
                            </p>
                            {prescription.length > 0 && (
                              <p className="text-sm opacity-90 mt-0.5">
                                {prescription.join(' • ')}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedExercise(isExpanded ? null : exercise.id)
                            }}
                            className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </div>

                        <AnimatePresence>
                          {isExpanded && exercise.cues && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 pb-3 pt-1 border-t border-white/10">
                                <p className="text-xs opacity-75 font-medium mb-1">Cues:</p>
                                <p className="text-sm opacity-90 leading-relaxed">
                                  {exercise.cues}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>

                <Link
                  href="/rehab/manage"
                  className="mt-4 flex items-center justify-center bg-white/10 hover:bg-white/20 py-3 rounded-lg font-semibold transition-colors"
                >
                  Manage Exercises
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </>
            )}
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: user.name === 'Devlin' ? 0.4 : 0.3 }}
          className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--border)]"
        >
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/calendar"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
            >
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-[var(--primary)] mr-3" />
                <span>View Calendar</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--foreground-muted)]" />
            </Link>
            <Link
              href="/stats"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-colors"
            >
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-[var(--secondary)] mr-3" />
                <span>View Progress</span>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--foreground-muted)]" />
            </Link>
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}