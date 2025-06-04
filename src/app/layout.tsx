import type { Metadata } from 'next';
import './globals.css';

import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Toaster } from 'react-hot-toast';
import { LayoutWithSidebar } from './layout-with-sidebar';
import { ReactQueryProvider } from '@/shared/lib/react-query';

export const metadata: Metadata = {
  title: 'Doable Tasks',
  manifest: '/manifest.json',
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <UserProvider>
        <body>
          <ReactQueryProvider>
            <LayoutWithSidebar>{children}</LayoutWithSidebar>
            <Toaster />
          </ReactQueryProvider>
        </body>
      </UserProvider>
    </html>
  );
}
