'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PageNav } from '@/components/PageNav';
import BottomNav from '@/components/BottomNav';
import {
  Dumbbell,
  Heart,
  User,
  Mail,
  Lock,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  Shield,
  Eye,
  EyeOff,
  TrendingUp,
  Calendar,
} from 'lucide-react';

interface UserSettings {
  id: string;
  name: string;
  email: string;
  rehabEnabled: boolean;
}

interface PrivacySettings {
  showWorkoutDetails: boolean;
  showExerciseNames: boolean;
  showPerformanceTrends: boolean;
  showWorkoutSchedule: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSettings | null>(null);
  const [rehabEnabled, setRehabEnabled] = useState(false);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    showWorkoutDetails: true,
    showExerciseNames: true,
    showPerformanceTrends: true,
    showWorkoutSchedule: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchUserSettings();
    fetchPrivacySettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setUser(data);
      setRehabEnabled(data.rehabEnabled);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const fetchPrivacySettings = async () => {
    try {
      const response = await fetch('/api/settings/privacy');
      if (response.ok) {
        const data = await response.json();
        setPrivacySettings({
          showWorkoutDetails: data.showWorkoutDetails,
          showExerciseNames: data.showExerciseNames,
          showPerformanceTrends: data.showPerformanceTrends,
          showWorkoutSchedule: data.showWorkoutSchedule,
        });
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  };

  const handleRehabToggle = async () => {
    const newValue = !rehabEnabled;
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rehabEnabled: newValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setRehabEnabled(newValue);
      setMessage({
        type: 'success',
        text: `Rehab features ${newValue ? 'enabled' : 'disabled'} successfully`,
      });

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update rehab setting:', error);
      setMessage({ type: 'error', text: 'Failed to update setting' });
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacyToggle = async (field: keyof PrivacySettings) => {
    const newValue = !privacySettings[field];
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to update privacy settings');
      }

      setPrivacySettings((prev) => ({ ...prev, [field]: newValue }));
      setMessage({
        type: 'success',
        text: 'Privacy settings updated successfully',
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to update privacy setting:', error);
      setMessage({ type: 'error', text: 'Failed to update privacy setting' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dark)] to-[var(--secondary)] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Dumbbell className="w-8 h-8 text-white" />
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] via-[var(--primary-dark)] to-[var(--secondary)] pb-6">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-xs text-white/80">Manage your preferences</p>
              </div>
            </div>
            <div className="hidden md:flex">
              <PageNav />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-500/20 border border-green-500/50'
                : 'bg-red-500/20 border border-red-500/50'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-300" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-300" />
            )}
            <span
              className={`text-sm ${
                message.type === 'success' ? 'text-green-100' : 'text-red-100'
              }`}
            >
              {message.text}
            </span>
          </motion.div>
        )}

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <h2 className="text-xl font-bold text-white mb-4">Account Info</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white/80">
              <User className="w-5 h-5" />
              <span>{user.name}</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <Mail className="w-5 h-5" />
              <span>{user.email}</span>
            </div>
          </div>
        </motion.div>

        {/* Rehab Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-6 h-6 text-teal-300" />
                <h2 className="text-xl font-bold text-white">Rehabilitation Features</h2>
              </div>
              <p className="text-white/85 text-sm">
                Enable rehab exercises and tracking for injury recovery and physical therapy
              </p>
            </div>
            <button
              onClick={handleRehabToggle}
              disabled={saving}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                rehabEnabled ? 'bg-teal-500' : 'bg-white/20'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  rehabEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {rehabEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-teal-500/10 rounded-lg border border-teal-500/30"
            >
              <p className="text-teal-100 text-sm">
                ✓ Rehab exercises section will now appear on your dashboard
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Privacy Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-blue-300" />
            <h2 className="text-xl font-bold text-white">Privacy Settings</h2>
          </div>
          <p className="text-white/80 text-sm mb-6">
            Control what information friends can see about your workouts
          </p>

          <div className="space-y-4">
            {/* Workout Details */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-5 h-5 text-white/85" />
                  <h3 className="text-white font-medium">Workout Details</h3>
                </div>
                <p className="text-white/80 text-sm">
                  Show specific exercises, sets, reps, and weights to friends
                </p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('showWorkoutDetails')}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  privacySettings.showWorkoutDetails ? 'bg-blue-500' : 'bg-white/20'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    privacySettings.showWorkoutDetails ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Exercise Names */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-5 h-5 text-white/85" />
                  <h3 className="text-white font-medium">Exercise Names</h3>
                </div>
                <p className="text-white/80 text-sm">Show what exercises you're doing to friends</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('showExerciseNames')}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  privacySettings.showExerciseNames ? 'bg-blue-500' : 'bg-white/20'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    privacySettings.showExerciseNames ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Performance Trends */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-white/85" />
                  <h3 className="text-white font-medium">Performance Trends</h3>
                </div>
                <p className="text-white/80 text-sm">
                  Show your progress over time, PRs, and strength gains
                </p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('showPerformanceTrends')}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  privacySettings.showPerformanceTrends ? 'bg-blue-500' : 'bg-white/20'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    privacySettings.showPerformanceTrends ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Workout Schedule */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-5 h-5 text-white/85" />
                  <h3 className="text-white font-medium">Workout Schedule</h3>
                </div>
                <p className="text-white/80 text-sm">Show calendar view of when you work out</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('showWorkoutSchedule')}
                disabled={saving}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  privacySettings.showWorkoutSchedule ? 'bg-blue-500' : 'bg-white/20'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    privacySettings.showWorkoutSchedule ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <p className="text-blue-100 text-sm">
              ℹ️ Note: Total sets, exercises, and last workout date are always visible to friends
              (baseline stats)
            </p>
          </div>
        </motion.div>

        {/* Password Change (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-6 h-6 text-white/80" />
            <h2 className="text-xl font-bold text-white">Change Password</h2>
          </div>
          <p className="text-white/80 text-sm mb-4">
            Update your password to keep your account secure
          </p>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20">
            Change Password
          </button>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
