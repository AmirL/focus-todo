'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

export default function Profile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <>
      {user && (
        <>
          <span>
            {user.name} ({user.email})
          </span>
          <a href="/api/auth/logout">Logout</a>
        </>
      )}
      {!user && <a href="/api/auth/login">Login</a>}
    </>
  );
}
