import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
// Session-based auth helpers only. API-key helpers live in './api-auth'.

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function validateUserSession() {
  const headerValues = headers();

  const session = await auth.api.getSession({
    headers: headerValues,
  });

  if (!session) {
    throw new AuthError('No session found');
  }

  if (!session.user) {
    throw new AuthError('No user found in session');
  }

  return session;
}
