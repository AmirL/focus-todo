'use client';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Menu, ChevronDown, CheckSquare2, LogOut, Calendar, Clock, ListTodo, Tag } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, useSidebar } from '@/shared/ui/sidebar';
import { Separator } from '@/shared/ui/separator';
import { useSession, signOut } from '@/shared/lib/auth-client';
import { TaskFilters } from '@/features/tasks/filter/ui/TaskFilters';

function MobileMenuButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button variant="outline" size="icon" onClick={toggleSidebar}>
      <Menu className="h-4 w-4" />
    </Button>
  );
}

function UserSection() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return (
      <div className="p-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  const logout = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 p-4">
      {session.user.image ? (
        <img src={session.user.image} alt={session.user.name || ''} className="h-8 w-8 rounded-full" />
      ) : (
        <div className="h-8 w-8 rounded-full bg-muted" />
      )}
      <div className="flex flex-1 items-center justify-between">
        <div>
          <p className="text-sm font-medium">{session.user.name?.split(' ')[0]}</p>
          <p className="text-xs text-muted-foreground">{session.user.email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <div className="md:hidden fixed top-4 left-4 z-50">
          <MobileMenuButton />
        </div>
        <Sidebar>
          <div className="flex flex-col h-full">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                  <CheckSquare2 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">Focus Todo</h1>
                  <p className="text-xs text-muted-foreground">Stay productive</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <TaskFilters />
            </SidebarContent>

            <div className="mt-auto">
              <Separator />
              <UserSection />
            </div>
          </div>
        </Sidebar>
        <div className="flex-1">{children}</div>
      </div>
    </SidebarProvider>
  );
}
