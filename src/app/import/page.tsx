'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { parseWorkoutTemplate } from '@/lib/template-parser';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  FileText,
  Upload,
  Check,
  Sparkles,
  Target,
  Clock,
  Award,
  Calendar,
} from 'lucide-react';
import { PageNav } from '@/components/PageNav';
import BottomNav from '@/components/BottomNav';

const TEMPLATES = {
  'Demo Workout': `Monday - Upper Body
Bench Press: 3x10 @ 43kg
Dumbbell Rows: 3x10 @ 14kg
Overhead Press: 3x8 @ 30kg
Bicep Curls: 3x12 @ 9kg
Tricep Extensions: 3x12 @ 7kg

Wednesday - Lower Body  
Squats: 3x10 @ 43kg
Walking Lunges: 3x10 @ bodyweight
Leg Press: 3x12 @ 82kg
Calf Raises: 3x15 @ 45kg
Leg Curls: 3x12 @ 23kg

Friday - Full Body
Deadlifts: 3x5 @ 61kg
Pull-ups: 3x5 @ bodyweight
Dumbbell Press: 3x10 @ 18kg
Plank: 3x30 @ bodyweight
Face Pulls: 3x15 @ 9kg`,

  '3-Day Split': `Monday - Chest & Triceps
Bench Press: 3x10 @ 61kg
Incline Dumbbell Press: 3x12 @ 23kg
Cable Flyes: 3x15 @ 14kg
Tricep Pushdowns: 3x12 @ 18kg

Wednesday - Back & Biceps
Deadlifts: 3x5 @ 102kg
Pull-ups: 3x8 @ bodyweight
Barbell Rows: 3x10 @ 43kg
Bicep Curls: 3x12 @ 14kg

Friday - Legs
Squats: 3x8 @ 84kg
Leg Press: 3x12 @ 122kg
Leg Curls: 3x15 @ 27kg
Calf Raises: 3x20 @ 45kg`,

  '4-Day Upper/Lower': `Monday - Upper Power
Bench Press: 5x5 @ 84kg
Overhead Press: 5x5 @ 43kg
Barbell Rows: 5x5 @ 61kg
Weighted Dips: 3x8 @ 11kg

Tuesday - Lower Power
Squats: 5x5 @ 102kg
Romanian Deadlifts: 3x8 @ 84kg
Leg Press: 3x10 @ 163kg
Walking Lunges: 3x12 @ bodyweight

Thursday - Upper Hypertrophy
Incline DB Press: 4x10 @ 27kg
Cable Rows: 4x12 @ 54kg
Lateral Raises: 4x15 @ 7kg
Cable Curls: 4x12 @ 23kg

Friday - Lower Hypertrophy
Front Squats: 4x10 @ 61kg
Leg Curls: 4x12 @ 36kg
Leg Extensions: 4x15 @ 45kg
Calf Raises: 4x20 @ 68kg`,

  '5-Day Push/Pull/Legs': `Monday - Push
Bench Press: 4x8 @ 70kg
Overhead Press: 3x10 @ 39kg
Incline DB Press: 3x12 @ 25kg
Lateral Raises: 4x15 @ 9kg
Tricep Extensions: 3x15 @ 32kg

Tuesday - Pull
Deadlifts: 4x6 @ 125kg
Pull-ups: 4x8 @ bodyweight
Cable Rows: 3x12 @ 64kg
Face Pulls: 3x15 @ 18kg
Barbell Curls: 3x12 @ 30kg

Wednesday - Legs
Squats: 4x8 @ 93kg
Romanian Deadlifts: 3x10 @ 75kg
Leg Press: 3x15 @ 181kg
Leg Curls: 3x12 @ 41kg
Calf Raises: 4x20 @ 91kg

Thursday - Push
DB Bench Press: 4x10 @ 30kg
Military Press: 3x8 @ 43kg
Cable Flyes: 3x15 @ 16kg
Upright Rows: 3x12 @ 30kg
Diamond Pushups: 3x15 @ bodyweight

Friday - Pull
Rack Pulls: 4x6 @ 143kg
T-Bar Rows: 4x10 @ 41kg
Lat Pulldowns: 3x12 @ 64kg
Shrugs: 3x15 @ 84kg
Hammer Curls: 3x12 @ 16kg`,
};

interface TemplateInfo {
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  daysPerWeek: number;
  icon: React.ReactNode;
}

const templateInfo: Record<string, TemplateInfo> = {
  'Demo Workout': {
    name: 'Demo Workout',
    description: 'Perfect for testing the app',
    difficulty: 'Beginner',
    daysPerWeek: 3,
    icon: <Sparkles className="w-5 h-5" />,
  },
  '3-Day Split': {
    name: '3-Day Split',
    description: 'Great for beginners',
    difficulty: 'Beginner',
    daysPerWeek: 3,
    icon: <Target className="w-5 h-5" />,
  },
  '4-Day Upper/Lower': {
    name: '4-Day Upper/Lower',
    description: 'Balanced muscle development',
    difficulty: 'Intermediate',
    daysPerWeek: 4,
    icon: <Award className="w-5 h-5" />,
  },
  '5-Day Push/Pull/Legs': {
    name: '5-Day Push/Pull/Legs',
    description: 'Advanced split routine',
    difficulty: 'Advanced',
    daysPerWeek: 5,
    icon: <Clock className="w-5 h-5" />,
  },
};

export default function ImportPage() {
  const router = useRouter();
  const [template, setTemplate] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [preview, setPreview] = useState<ReturnType<typeof parseWorkoutTemplate> | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [step, setStep] = useState<'select' | 'customize' | 'preview'>('select');

  const handlePreview = () => {
    try {
      const parsed = parseWorkoutTemplate(template);
      setPreview(parsed);
    } catch (error) {
      console.error('Failed to parse template:', error);
      alert('Failed to parse template. Please check the format.');
    }
  };

  const handleImport = async () => {
    if (!preview || preview.length === 0) return;

    setImporting(true);
    try {
      const response = await fetch('/api/workouts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workouts: preview, startDate }),
      });

      if (response.ok) {
        router.push('/calendar');
      } else {
        throw new Error('Failed to import workouts');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import workouts');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen pb-6 overflow-hidden relative">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </Link>
            <h1 className="text-xl font-bold text-center text-white">Plans</h1>
            <div className="hidden md:flex">
              <PageNav />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* Page Title and Progress Steps */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white text-center mb-4">Import Workout Plan</h2>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-2">
            {['select', 'customize', 'preview'].map((s, i) => (
              <div key={s} className="flex items-center">
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step === s
                      ? 'bg-white text-[var(--primary)]'
                      : ['customize', 'preview'].indexOf(step) > i
                        ? 'bg-green-400 text-white'
                        : 'bg-white/20 text-white/80'
                  }`}
                  animate={{ scale: step === s ? 1.1 : 1 }}
                >
                  {['customize', 'preview'].indexOf(step) > i ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    i + 1
                  )}
                </motion.div>
                {i < 2 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      ['customize', 'preview'].indexOf(step) > i ? 'bg-green-400' : 'bg-white/20'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {/* Step 1: Select Template */}
          {step === 'select' && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Choose a Workout Plan</h2>

              {/* Template Cards */}
              <div className="space-y-4 mb-6">
                {Object.entries(templateInfo).map(([key, info]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedTemplate(key);
                      setTemplate(TEMPLATES[key as keyof typeof TEMPLATES]);
                    }}
                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
                      selectedTemplate === key
                        ? 'bg-white/30 border-white backdrop-blur-md'
                        : 'bg-white/10 border-white/20 hover:border-white/40 backdrop-blur-md'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`p-2 rounded-lg ${
                              selectedTemplate === key ? 'bg-white' : 'bg-white/20'
                            }`}
                          >
                            <div
                              className={
                                selectedTemplate === key ? 'text-[var(--primary)]' : 'text-white'
                              }
                            >
                              {info.icon}
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-white">{info.name}</h3>
                        </div>
                        <p className="text-white/85 mb-2">{info.description}</p>
                        <div className="flex gap-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full ${
                              info.difficulty === 'Beginner'
                                ? 'bg-green-400/30 text-green-100'
                                : info.difficulty === 'Intermediate'
                                  ? 'bg-yellow-400/30 text-yellow-100'
                                  : 'bg-red-400/30 text-red-100'
                            }`}
                          >
                            {info.difficulty}
                          </span>
                          <span className="text-white/85">{info.daysPerWeek} days/week</span>
                        </div>
                      </div>
                      {selectedTemplate === key && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-white"
                        >
                          <Check className="w-6 h-6" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                ))}

                {/* Custom Option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedTemplate('');
                    setTemplate('');
                  }}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
                    selectedTemplate === ''
                      ? 'bg-white/30 border-white backdrop-blur-md'
                      : 'bg-white/10 border-white/20 hover:border-white/40 backdrop-blur-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        selectedTemplate === '' ? 'bg-white' : 'bg-white/20'
                      }`}
                    >
                      <FileText
                        className={`w-5 h-5 ${
                          selectedTemplate === '' ? 'text-[var(--primary)]' : 'text-white'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Custom Workout</h3>
                      <p className="text-white/85">Create your own plan</p>
                    </div>
                  </div>
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('customize')}
                disabled={!selectedTemplate && !template}
                className="w-full bg-white text-[var(--primary)] py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Customize */}
          {step === 'customize' && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Customize Your Plan</h2>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Workout Plan Details
                </label>
                <p className="text-xs text-white/85 mb-4">
                  Format: Day - Name, then Exercise: SetsxReps @ Weight
                </p>
                <textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  placeholder="Monday - Chest & Triceps
Bench Press: 3x10 @ 61kg
Incline Dumbbell Press: 3x12 @ 23kg
..."
                  className="w-full h-64 p-4 bg-white/10 border border-white/20 text-white placeholder:text-white/75 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent font-mono text-sm"
                />

                <div className="mt-6">
                  <label className="block text-sm font-medium text-white mb-2">Start Date</label>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-white/85" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 bg-white/10 text-white py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-md"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handlePreview();
                    if (template) setStep('preview');
                  }}
                  className="flex-1 bg-white text-[var(--primary)] py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  Preview
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Preview & Import */}
          {step === 'preview' && preview && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Review Your Plan</h2>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 mb-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {preview.map((workout, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-white/10 pb-4 last:border-0"
                    >
                      <h4 className="font-semibold text-lg text-white mb-2 flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-white/85" />
                        {workout.day}
                      </h4>
                      <ul className="space-y-2">
                        {workout.exercises.map((exercise, i) => (
                          <li key={i} className="text-white/85 text-sm pl-6">
                            <span className="font-medium text-white">{exercise.name}:</span>{' '}
                            {exercise.sets}x{exercise.reps} @ {exercise.weight}kg
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep('customize')}
                  className="flex-1 bg-white/10 text-white py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-md"
                >
                  Back
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleImport}
                  disabled={importing}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 text-white py-4 rounded-xl font-semibold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {importing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Dumbbell className="w-5 h-5" />
                      </motion.div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Import Plan
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}
