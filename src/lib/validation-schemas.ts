import { z } from 'zod';

/**
 * Centralized validation schemas for API requests
 * All API route handlers should use these schemas to validate input
 */

// Set update schema
export const updateSetSchema = z.object({
  completed: z.boolean().optional(),
  weight: z.number().positive('Weight must be positive').optional(),
});

export type UpdateSetInput = z.infer<typeof updateSetSchema>;

// Workout creation schema
export const createWorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  exercises: z
    .array(
      z.object({
        name: z.string().min(1, 'Exercise name is required').max(200),
        sets: z
          .array(
            z.object({
              reps: z.number().int().min(0).max(1000),
              weight: z.number().min(0).max(10000),
            })
          )
          .min(1, 'At least one set is required'),
      })
    )
    .optional(),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

// Workout import schema
export const importWorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  template: z.string().min(1, 'Template content is required'),
});

export type ImportWorkoutInput = z.infer<typeof importWorkoutSchema>;

// Rehab exercise schema
export const createRehabExerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required').max(200),
  category: z.enum(['warmup', 'mobility', 'strength', 'other']),
  sets: z.number().int().min(1).max(100).optional(),
  reps: z.number().int().min(1).max(1000).optional(),
  holdTime: z.number().int().min(0).max(600).optional(),
  resistanceBand: z.string().max(100).optional(),
  weight: z.number().min(0).max(1000).optional(),
  side: z.enum(['left', 'right', 'both']).optional(),
  notes: z.string().max(1000).optional(),
});

export type CreateRehabExerciseInput = z.infer<typeof createRehabExerciseSchema>;

export const updateRehabExerciseSchema = createRehabExerciseSchema.partial().extend({
  completed: z.boolean().optional(),
});

export type UpdateRehabExerciseInput = z.infer<typeof updateRehabExerciseSchema>;

// Authentication schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
});

export type RegisterInput = z.infer<typeof registerSchema>;
