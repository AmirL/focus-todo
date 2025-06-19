import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';

export async function validateUserSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  invariant(session, 'No session found');
  invariant(session.user, 'No user found in session');
  invariant(session.user.role === 'admin', 'User is not an admin');
  
  return session;
}

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
