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

export function isAuthError(error: unknown): boolean {
  return error instanceof AuthError;
}
