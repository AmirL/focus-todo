'use client';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, useSidebar } from '@/shared/ui/sidebar';

function MobileMenuButton() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button variant="outline" size="icon" onClick={toggleSidebar}>
      <Menu className="h-4 w-4" />
    </Button>
  );
}

export function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <MobileMenuButton />
        </div>
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-lg font-semibold">Navigation</h2>
          </SidebarHeader>
          <SidebarContent>
            <div className="space-y-1">
              <Link href="/">
                <Button variant={pathname === '/' ? 'secondary' : 'ghost'} className="w-full justify-start">
                  Tasks
                </Button>
              </Link>
              <Link href="/lists">
                <Button variant={pathname === '/lists' ? 'secondary' : 'ghost'} className="w-full justify-start">
                  Lists
                </Button>
              </Link>
            </div>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1">{children}</div>
      </div>
    </SidebarProvider>
  );
}
