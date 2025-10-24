'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Dumbbell, Sparkles } from 'lucide-react';

interface GymPlanGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanGenerated: (plan: any) => void;
}

export function GymPlanGeneratorModal({
  open,
  onOpenChange,
  onPlanGenerated,
}: GymPlanGeneratorModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fitnessGoal: '',
    fitnessLevel: '',
    daysPerWeek: 3,
    equipmentAccess: '',
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gym-plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate plan');
      }

      const plan = await response.json();
      onPlanGenerated(plan);
      onOpenChange(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      fitnessGoal: '',
      fitnessLevel: '',
      daysPerWeek: 3,
      equipmentAccess: '',
    });
    setError(null);
  };

  const isStepComplete = () => {
    switch (step) {
      case 1:
        return formData.fitnessGoal !== '';
      case 2:
        return formData.fitnessLevel !== '';
      case 3:
        return formData.daysPerWeek >= 1 && formData.daysPerWeek <= 7;
      case 4:
        return formData.equipmentAccess !== '';
      default:
        return false;
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-[var(--surface)] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  <Dialog.Title className="text-xl font-bold">Generate Gym Plan</Dialog.Title>
                </div>
                <Dialog.Close className="p-1 rounded-lg hover:bg-white/20 transition-colors">
                  <X className="w-5 h-5" />
                </Dialog.Close>
              </div>
              <div className="flex gap-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i + 1 <= step ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
                      What's your fitness goal?
                    </h3>
                    <div className="space-y-2">
                      {[
                        { value: 'weight_loss', label: 'Weight Loss & Fat Burning', emoji: '🔥' },
                        { value: 'muscle_gain', label: 'Muscle Growth', emoji: '💪' },
                        { value: 'strength', label: 'Strength & Power', emoji: '⚡' },
                        { value: 'endurance', label: 'Endurance & Cardio', emoji: '🏃' },
                        { value: 'general_fitness', label: 'General Fitness', emoji: '🎯' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setFormData({ ...formData, fitnessGoal: option.value })}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            formData.fitnessGoal === option.value
                              ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                              : 'border-gray-200 dark:border-gray-700 hover:border-[var(--primary)]/50'
                          }`}
                        >
                          <span className="text-2xl mr-3">{option.emoji}</span>
                          <span className="font-medium text-[var(--foreground)]">
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
                      What's your experience level?
                    </h3>
                    <div className="space-y-2">
                      {[
                        {
                          value: 'beginner',
                          label: 'Beginner',
                          desc: '0-1 years of training',
                        },
                        {
                          value: 'intermediate',
                          label: 'Intermediate',
                          desc: '1-3 years of training',
                        },
                        {
                          value: 'advanced',
                          label: 'Advanced',
                          desc: '3+ years of training',
                        },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setFormData({ ...formData, fitnessLevel: option.value })}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            formData.fitnessLevel === option.value
                              ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                              : 'border-gray-200 dark:border-gray-700 hover:border-[var(--primary)]/50'
                          }`}
                        >
                          <div className="font-medium text-[var(--foreground)]">{option.label}</div>
                          <div className="text-sm text-[var(--foreground-muted)] mt-1">
                            {option.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
                      How many days per week?
                    </h3>
                    <div className="flex items-center justify-center gap-4 py-8">
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            daysPerWeek: Math.max(1, formData.daysPerWeek - 1),
                          })
                        }
                        className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        -
                      </button>
                      <div className="text-6xl font-bold text-[var(--primary)] min-w-[100px] text-center">
                        {formData.daysPerWeek}
                      </div>
                      <button
                        onClick={() =>
                          setFormData({
                            ...formData,
                            daysPerWeek: Math.min(7, formData.daysPerWeek + 1),
                          })
                        }
                        className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-center text-sm text-[var(--foreground-muted)]">
                      Recommended: 3-5 days per week
                    </p>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                  >
                    <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">
                      What equipment do you have?
                    </h3>
                    <div className="space-y-2">
                      {[
                        {
                          value: 'gym',
                          label: 'Full Gym Access',
                          desc: 'Barbells, machines, cables',
                        },
                        {
                          value: 'home',
                          label: 'Home Equipment',
                          desc: 'Dumbbells, bands, bench',
                        },
                        {
                          value: 'bodyweight',
                          label: 'Bodyweight Only',
                          desc: 'No equipment needed',
                        },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            setFormData({ ...formData, equipmentAccess: option.value })
                          }
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            formData.equipmentAccess === option.value
                              ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                              : 'border-gray-200 dark:border-gray-700 hover:border-[var(--primary)]/50'
                          }`}
                        >
                          <div className="font-medium text-[var(--foreground)]">{option.label}</div>
                          <div className="text-sm text-[var(--foreground-muted)] mt-1">
                            {option.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 dark:bg-gray-900 flex justify-between gap-3">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              <button
                onClick={step === totalSteps ? handleSubmit : handleNext}
                disabled={!isStepComplete() || loading}
                className="ml-auto flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Dumbbell className="w-4 h-4" />
                    </motion.div>
                    Generating...
                  </>
                ) : step === totalSteps ? (
                  <>
                    Generate Plan
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
