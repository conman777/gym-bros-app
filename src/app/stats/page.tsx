'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Trophy, Flame, TrendingUp, Calendar, Target, Award, Activity } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

interface StatsData {
  user: {
    name: string
    stats: {
      totalSetsCompleted: number
      totalExercises: number
      lastWorkoutDate?: string
    } | null
    workouts: Array<{ date: string; completed: boolean }>
  }
  monthlySets: number
  topExercise: [string, number] | null
  currentStreak: number
}

export default function StatsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          router.push('/')
          return
        }
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Stats error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Activity className="w-8 h-8 text-[var(--primary)]" />
        </motion.div>
      </div>
    )
  }

  if (!stats) return null

  const { user, monthlySets, topExercise, currentStreak } = stats
  const totalSets = user.stats?.totalSetsCompleted || 0
  const totalExercises = user.stats?.totalExercises || 0
  const activeDays = user.workouts.length

  // Calculate week streak based on total sets
  const weekStreak = totalSets ? Math.floor(totalSets / 7) : 0

  // Calculate progress percentages for visual indicators
  const monthlyGoal = 100 // Example goal
  const monthlyProgress = Math.min((monthlySets / monthlyGoal) * 100, 100)

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {/* Header */}
      <header className="bg-[var(--surface)] shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link 
              href="/dashboard" 
              className="p-2 -ml-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold flex-1 text-center mr-8">Progress & Stats</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Total Progress</h2>
              <p className="text-white/80">Keep up the great work!</p>
            </div>
            <Trophy className="w-12 h-12 text-white/40" />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <motion.div 
                className="text-4xl font-bold mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                {totalSets}
              </motion.div>
              <p className="text-white/80">Total Sets</p>
            </div>
            <div>
              <motion.div 
                className="text-4xl font-bold mb-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
              >
                {activeDays}
              </motion.div>
              <p className="text-white/80">Active Days</p>
            </div>
          </div>
        </motion.div>

        {/* Monthly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--border)]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">This Month</h3>
            <Calendar className="w-5 h-5 text-[var(--primary)]" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-[var(--foreground-muted)]">Sets completed</span>
                <span className="font-semibold">{monthlySets}/{monthlyGoal}</span>
              </div>
              <div className="bg-[var(--border)] rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${monthlyProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
            
            {topExercise && (
              <div className="pt-2">
                <p className="text-[var(--foreground-muted)] mb-1">Most done exercise</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{topExercise[0]}</span>
                  <span className="text-[var(--primary)]">{topExercise[1]} sets</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--border)]"
          >
            <div className="flex items-center justify-between mb-3">
              <Flame className="w-8 h-8 text-[var(--danger)]" />
              <motion.span 
                className="text-3xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
              >
                {currentStreak}
              </motion.span>
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">Day Streak</p>
            {currentStreak > 0 && <p className="text-xs text-[var(--primary)]">Keep it up! 🔥</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--border)]"
          >
            <div className="flex items-center justify-between mb-3">
              <Award className="w-8 h-8 text-[var(--accent)]" />
              <motion.span 
                className="text-3xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.4 }}
              >
                {weekStreak}
              </motion.span>
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">Week Streak</p>
            <p className="text-xs text-[var(--accent)]">Consistency pays off!</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--border)]"
          >
            <div className="flex items-center justify-between mb-3">
              <Target className="w-8 h-8 text-[var(--secondary)]" />
              <motion.span 
                className="text-3xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.5 }}
              >
                {totalExercises}
              </motion.span>
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">Exercises Done</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--border)]"
          >
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-[var(--primary)]" />
              <motion.span 
                className="text-3xl font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.6 }}
              >
                {Math.round(totalSets / Math.max(activeDays, 1))}
              </motion.span>
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">Avg Sets/Day</p>
          </motion.div>
        </div>

        {/* Last Workout */}
        {user.stats?.lastWorkoutDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[var(--surface)] rounded-2xl p-6 shadow-sm border border-[var(--border)]"
          >
            <h3 className="text-lg font-semibold mb-3">Last Workout</h3>
            <p className="text-[var(--foreground-muted)]">
              {new Date(user.stats.lastWorkoutDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}