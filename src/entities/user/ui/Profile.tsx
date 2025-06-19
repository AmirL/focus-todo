'use client';

import { Button } from '@/shared/ui/button';
import { useSession, signOut } from '@/shared/lib/auth-client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Profile() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) return <div>Loading...</div>;

  const logout = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <>
      {session && (
        <>
          {session.user.name && <span className="text-sm font-medium">{session.user.name.split(' ')[0]}</span>}
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary" onClick={logout}>
            <LogOut className="h-4 w-4 mr-1" />
          </Button>
        </>
      )}
      {!session && <Link href="/login">Login</Link>}
    </>
  );
}
