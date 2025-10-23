import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Standardized API error handling utility
 * Provides consistent error responses across all API routes
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Handle API errors with consistent formatting and logging
 * @param error - The error to handle
 * @param context - Description of where the error occurred
 * @returns NextResponse with appropriate status code and error message
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  // Zod validation errors
  if (error instanceof ZodError) {
    const zodError = error as ZodError<unknown>;
    console.error(`Validation error in ${context}:`, zodError.issues);
    return NextResponse.json(
      {
        error: 'Invalid request data',
        details: zodError.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Custom API errors with specific status codes
  if (error instanceof ApiError) {
    console.error(`${context}: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  // Generic errors
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error(`${context}:`, error);

  return NextResponse.json({ error: `${context}: ${errorMessage}` }, { status: 500 });
}

/**
 * Common API error responses
 */
export const ApiErrors = {
  Unauthorized: new ApiError('Unauthorized. Please log in.', 401),
  Forbidden: new ApiError("Forbidden. You don't have permission to access this resource.", 403),
  NotFound: new ApiError('Resource not found.', 404),
  InvalidInput: new ApiError('Invalid input data.', 400),
} as const;
