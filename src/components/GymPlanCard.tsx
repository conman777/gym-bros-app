'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, ChevronDown, ChevronUp, Sparkles, Calendar, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface GymPlanCardProps {
  plan: any;
  onViewDetails?: () => void;
  onRegeneratePlan?: () => void;
}

export function GymPlanCard({ plan, onViewDetails, onRegeneratePlan }: GymPlanCardProps) {
  const [expanded, setExpanded] = useState(false);

  const planContent = plan.planContent;
  const weeklySchedule = plan.weeklySchedule;

  const formatGoalLabel = (goal: string) => {
    const labels: Record<string, string> = {
      weight_loss: 'Weight Loss',
      muscle_gain: 'Muscle Gain',
      strength: 'Strength',
      endurance: 'Endurance',
      general_fitness: 'General Fitness',
    };
    return labels[goal] || goal;
  };

  const formatLevelLabel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Your AI Gym Plan</h3>
            <p className="text-sm opacity-90">
              {formatGoalLabel(plan.fitnessGoal)} • {formatLevelLabel(plan.fitnessLevel)} •{' '}
              {plan.daysPerWeek} days/week
            </p>
          </div>
        </div>
      </div>

      {/* Overview */}
      <div className="bg-white/10 rounded-xl p-4 mb-4">
        <p className="text-sm leading-relaxed">{planContent.overview}</p>
      </div>

      {/* Goals */}
      {planContent.goals && planContent.goals.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-sm opacity-90">Goals:</h4>
          <ul className="space-y-1">
            {planContent.goals.slice(0, 3).map((goal: string, index: number) => (
              <li key={index} className="text-sm flex items-start gap-2">
                <span className="text-yellow-300">•</span>
                <span>{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weekly Schedule Preview */}
      <div className="mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
        >
          <span className="font-semibold text-sm">Weekly Schedule</span>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-2 max-h-96 overflow-y-auto">
                {weeklySchedule.map((day: any) => (
                  <div key={day.day} className="bg-white/10 rounded-lg p-3">
                    <div className="font-semibold text-sm mb-1">
                      Day {day.day}: {day.dayName}
                    </div>
                    <div className="text-xs opacity-90 mb-2">{day.focus}</div>
                    <div className="space-y-1">
                      {day.exercises.slice(0, 3).map((exercise: any, idx: number) => (
                        <div key={idx} className="text-xs flex items-start gap-2">
                          <Dumbbell className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span>
                            {exercise.name} - {exercise.sets}x{exercise.reps}
                          </span>
                        </div>
                      ))}
                      {day.exercises.length > 3 && (
                        <div className="text-xs opacity-70 pl-5">
                          +{day.exercises.length - 3} more exercises
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Link
          href="/import"
          className="flex-1 flex items-center justify-center gap-2 bg-white text-purple-600 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Import to Calendar
        </Link>
        {onRegeneratePlan && (
          <button
            onClick={onRegeneratePlan}
            className="flex items-center justify-center gap-2 bg-white/20 text-white py-3 px-4 rounded-xl font-semibold hover:bg-white/30 transition-colors"
            title="Regenerate Plan"
          >
            <RefreshCw className="w-4 h-4" />
            Redo
          </button>
        )}
      </div>
    </motion.div>
  );
}
