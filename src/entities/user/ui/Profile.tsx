'use client';

import { Button } from '@/shared/ui/button';
import { useUser } from '@auth0/nextjs-auth0/client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  const logout = () => router.push('/api/auth/logout');

  return (
    <>
      {user && (
        <>
          {user.name && <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>}
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={logout}>
            <LogOut className="h-4 w-4 mr-1" />
          </Button>
        </>
      )}
      {!user && <a href="/api/auth/login">Login</a>}
    </>
  );
}
