'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, Trash2, Save, Edit3, GripVertical } from 'lucide-react';
import type { RehabExercise } from '@/lib/types';

export default function ManageRehabPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<RehabExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newExercise, setNewExercise] = useState({ name: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/rehab');
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = async () => {
    if (!newExercise.name.trim()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/rehab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExercise),
      });

      if (response.ok) {
        await fetchExercises();
        setNewExercise({ name: '', description: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add exercise:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateExercise = async (id: string, updates: Partial<RehabExercise>) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/rehab/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await fetchExercises();
        setEditingId(null);
      }
    } catch (error) {
      console.error('Failed to update exercise:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/rehab/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchExercises();
      }
    } catch (error) {
      console.error('Failed to delete exercise:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--foreground-muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      <header className="bg-[var(--surface)] shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-xl font-bold">Manage Rehab Exercises</h1>
            <div />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Add Exercise Button/Form */}
        <AnimatePresence mode="wait">
          {!showAddForm ? (
            <motion.button
              key="add-button"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={() => setShowAddForm(true)}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-teal-700 hover:to-cyan-800 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add New Exercise
            </motion.button>
          ) : (
            <motion.div
              key="add-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--surface)] rounded-2xl p-6 shadow-lg border border-[var(--border)]"
            >
              <h3 className="font-semibold mb-4">Add New Exercise</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newExercise.description}
                  onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleAddExercise}
                    disabled={!newExercise.name.trim() || saving}
                    className="flex-1 bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Exercise
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewExercise({ name: '', description: '' });
                    }}
                    className="px-6 py-3 bg-[var(--border)] rounded-lg font-semibold hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Exercise List */}
        {exercises.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[var(--foreground-muted)] mb-4">No exercises yet</p>
            <p className="text-sm text-[var(--foreground-muted)]">
              Add your first rehab exercise above
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[var(--surface)] rounded-2xl p-5 shadow-sm border border-[var(--border)]"
              >
                {editingId === exercise.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      defaultValue={exercise.name}
                      onBlur={(e) => handleUpdateExercise(exercise.id, { name: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <textarea
                      defaultValue={exercise.description || ''}
                      onBlur={(e) =>
                        handleUpdateExercise(exercise.id, { description: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      rows={2}
                    />
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-sm text-teal-500 hover:text-teal-600"
                    >
                      Done Editing
                    </button>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{exercise.name}</h3>
                      {exercise.description && (
                        <p className="text-sm text-[var(--foreground-muted)]">
                          {exercise.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(exercise.id)}
                        className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                        disabled={saving}
                      >
                        <Edit3 className="w-5 h-5 text-[var(--foreground-muted)]" />
                      </button>
                      <button
                        onClick={() => handleDeleteExercise(exercise.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        disabled={saving}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
