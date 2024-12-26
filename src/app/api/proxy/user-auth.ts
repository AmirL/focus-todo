import { getSession } from '@auth0/nextjs-auth0';
const APP_NAMESPACE = 'https://doable-tasks.vercel.app';

export async function validateUserSession() {
  const session = await getSession();
  invariant(session, 'No session found');
  invariant(session.user, 'No user found in session');

  const roles = session.user[`${APP_NAMESPACE}/roles`] || [];
  invariant(roles.includes('admin'), 'User is not an admin');
}

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
