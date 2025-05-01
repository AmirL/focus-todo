'use client';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Menu, ChevronDown, CheckSquare2, LogOut, Calendar, Clock, ListTodo, Tag } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, useSidebar } from '@/shared/ui/sidebar';
import { Separator } from '@/shared/ui/separator';
import { useUser } from '@auth0/nextjs-auth0/client';
import { StatusFilterEnum, useFilterStore } from '@/_pages/tasks-todo/model/filterStore';
import { ListsNames } from '@/entities/task/model/task';

function MobileMenuButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button variant="outline" size="icon" onClick={toggleSidebar}>
      <Menu className="h-4 w-4" />
    </Button>
  );
}

function UserSection() {
  const { user } = useUser();
  const router = useRouter();

  if (!user) {
    return (
      <div className="p-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/api/auth/login">Login</Link>
        </Button>
      </div>
    );
  }

  const logout = () => router.push('/api/auth/logout');

  return (
    <div className="flex items-center gap-2 p-4">
      {user.picture ? (
        <img src={user.picture} alt={user.name || ''} className="h-8 w-8 rounded-full" />
      ) : (
        <div className="h-8 w-8 rounded-full bg-muted" />
      )}
      <div className="flex flex-1 items-center justify-between">
        <div>
          <p className="text-sm font-medium">{user.name?.split(' ')[0]}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={logout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function FilterButton({
  filter,
  active,
  children,
  icon: Icon,
}: {
  filter: StatusFilterEnum;
  active: boolean;
  children: React.ReactNode;
  icon: React.ElementType;
}) {
  const { setStatusFilter } = useFilterStore();

  return (
    <Button
      variant={active ? 'secondary' : 'ghost'}
      className="w-full justify-start"
      onClick={() => setStatusFilter(filter)}
    >
      <Icon className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );
}

function CategoryButton({ category, active }: { category: string; active: boolean }) {
  const { list, setList } = useFilterStore();

  return (
    <Button variant={active ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setList(category)}>
      <Tag className="mr-2 h-4 w-4" />
      {category}
    </Button>
  );
}

export function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { statusFilter, list } = useFilterStore();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <div className="lg:hidden fixed top-4 left-4 z-50">
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
              <div className="space-y-4">
                <div className="px-2">
                  <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">Filters</h2>
                  <div className="space-y-1">
                    <FilterButton
                      filter={StatusFilterEnum.BACKLOG}
                      active={statusFilter === StatusFilterEnum.BACKLOG}
                      icon={ListTodo}
                    >
                      Backlog
                    </FilterButton>
                    <FilterButton
                      filter={StatusFilterEnum.SELECTED}
                      active={statusFilter === StatusFilterEnum.SELECTED}
                      icon={CheckSquare2}
                    >
                      Selected
                    </FilterButton>
                    <FilterButton
                      filter={StatusFilterEnum.TODAY}
                      active={statusFilter === StatusFilterEnum.TODAY}
                      icon={Calendar}
                    >
                      Today
                    </FilterButton>
                    <FilterButton
                      filter={StatusFilterEnum.FUTURE}
                      active={statusFilter === StatusFilterEnum.FUTURE}
                      icon={Clock}
                    >
                      Future
                    </FilterButton>
                  </div>
                </div>

                <div className="px-2">
                  <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">Categories</h2>
                  <div className="space-y-1">
                    {ListsNames.map((category) => (
                      <CategoryButton key={category} category={category} active={list === category} />
                    ))}
                  </div>
                </div>
              </div>
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
