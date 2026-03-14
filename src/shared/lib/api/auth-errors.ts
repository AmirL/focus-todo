import { NextResponse } from 'next/server';

/** Base class for authentication errors. Used by both session and API key auth. */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/** API key specific auth error. Extends AuthError for unified error handling. */
export class ApiAuthError extends AuthError {
  constructor(message: string) {
    super(message);
    this.name = 'ApiAuthError';
  }
}

function isAuthError(error: unknown): boolean {
  return error instanceof AuthError;
}

/** Shared error handler for API routes. Returns a JSON error response with appropriate status. */
export function handleApiError(error: unknown, operation: string) {
  const msg = error instanceof Error ? error.message : 'Unknown error occurred';
  const status = isAuthError(error) ? 401 : 500;
  if (!isAuthError(error)) {
    console.error(`Error in ${operation}:`, error);
  }
  return NextResponse.json({ error: msg }, { status });
}
