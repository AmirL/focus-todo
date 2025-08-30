import { auth } from '@/shared/lib/auth';
import { headers } from 'next/headers';
// Session-based auth helpers only. API-key helpers live in './api-auth'.

export async function validateUserSession() {
  try {
    const headerValues = headers();

    const session = await auth.api.getSession({
      headers: headerValues,
    });

    if (!session) {
      throw new Error('No session found');
    }

    if (!session.user) {
      throw new Error('No user found in session');
    }

    return session;
  } catch (error) {
    console.error('Session validation failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}
