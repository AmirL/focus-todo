import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
import { AuthError } from '@/shared/lib/api/auth-errors';

export { AuthError } from '@/shared/lib/api/auth-errors';

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
