'use client';

import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Cigarette, Pill, RotateCcw } from 'lucide-react';
import type { HabitStats, HabitType } from '@/lib/types';

export function HabitTrackingCard() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery<HabitStats>({
    queryKey: ['habitStats'],
    queryFn: async () => {
      const response = await fetch('/api/habits');
      if (!response.ok) throw new Error('Failed to fetch habit stats');
      return response.json();
    },
  });

  const logHabitMutation = useMutation({
    mutationFn: async (type: HabitType) => {
      const response = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (!response.ok) throw new Error('Failed to log habit');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitStats'] });
    },
  });

  const undoMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/habits/undo', {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to undo');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habitStats'] });
    },
  });

  const hasLogsToday = stats && (stats.today.smoking > 0 || stats.today.nicotinePouches > 0);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-white/20 rounded w-1/3 mb-4"></div>
          <div className="h-24 bg-white/20 rounded"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20"
    >
      <h2 className="text-xl font-bold text-white mb-4">Habit Tracking</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => logHabitMutation.mutate('SMOKING')}
          disabled={logHabitMutation.isPending}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-4 px-6 rounded-xl font-semibold flex flex-col items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-white/20 active:scale-95"
        >
          <Cigarette className="w-6 h-6 text-orange-300" />
          <span>Smoked</span>
        </button>

        <button
          onClick={() => logHabitMutation.mutate('NICOTINE_POUCH')}
          disabled={logHabitMutation.isPending}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-4 px-6 rounded-xl font-semibold flex flex-col items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-white/20 active:scale-95"
        >
          <Pill className="w-6 h-6 text-cyan-300" />
          <span>Nicotine Pouch</span>
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-sm font-semibold text-white/70 mb-3">Today</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Cigarette className="w-4 h-4 text-orange-300" />
              <span className="text-white font-semibold">{stats?.today.smoking || 0}</span>
              <span className="text-white/60 text-sm">cigarettes</span>
            </div>
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-cyan-300" />
              <span className="text-white font-semibold">{stats?.today.nicotinePouches || 0}</span>
              <span className="text-white/60 text-sm">pouches</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-sm font-semibold text-white/70 mb-3">This Week</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Cigarette className="w-4 h-4 text-orange-300" />
              <span className="text-white font-semibold">{stats?.thisWeek.smoking || 0}</span>
              <span className="text-white/60 text-sm">cigarettes</span>
            </div>
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-cyan-300" />
              <span className="text-white font-semibold">
                {stats?.thisWeek.nicotinePouches || 0}
              </span>
              <span className="text-white/60 text-sm">pouches</span>
            </div>
          </div>
        </div>

        {hasLogsToday && (
          <button
            onClick={() => undoMutation.mutate()}
            disabled={undoMutation.isPending}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Undo Last Entry</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
