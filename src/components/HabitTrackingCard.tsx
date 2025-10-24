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
        className="bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/20"
      >
        <div className="animate-pulse">
          <div className="h-5 bg-white/20 rounded w-1/3 mb-2"></div>
          <div className="h-20 bg-white/20 rounded"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/20"
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-bold text-white">Habit Tracking</h2>
        {hasLogsToday && (
          <button
            onClick={() => undoMutation.mutate()}
            disabled={undoMutation.isPending}
            className="bg-white/10 hover:bg-white/20 text-white py-1 px-2 rounded-lg font-medium flex items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 text-xs"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <button
          onClick={() => logHabitMutation.mutate('SMOKING')}
          disabled={logHabitMutation.isPending}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-white/20 active:scale-95 text-xs"
        >
          <Cigarette className="w-4 h-4 text-orange-300" />
          <span>Smoked</span>
        </button>

        <button
          onClick={() => logHabitMutation.mutate('NICOTINE_POUCH')}
          disabled={logHabitMutation.isPending}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-white/20 active:scale-95 text-xs"
        >
          <Pill className="w-4 h-4 text-cyan-300" />
          <span>Pouch</span>
        </button>
      </div>

      <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <div className="text-white/50 font-medium mb-1.5">Today</div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Cigarette className="w-3.5 h-3.5 text-orange-300 shrink-0" />
                <span className="text-white font-semibold">{stats?.today.smoking || 0}</span>
                <span className="text-white/40">cigs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span className="text-white font-semibold">
                  {stats?.today.nicotinePouches || 0}
                </span>
                <span className="text-white/40">pouches</span>
              </div>
            </div>
          </div>
          <div>
            <div className="text-white/50 font-medium mb-1.5">This Week</div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Cigarette className="w-3.5 h-3.5 text-orange-300 shrink-0" />
                <span className="text-white font-semibold">{stats?.thisWeek.smoking || 0}</span>
                <span className="text-white/40">cigs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span className="text-white font-semibold">
                  {stats?.thisWeek.nicotinePouches || 0}
                </span>
                <span className="text-white/40">pouches</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
