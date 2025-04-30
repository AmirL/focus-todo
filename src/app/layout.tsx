import type { Metadata } from 'next';
import './globals.css';

import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Toaster } from 'react-hot-toast';
import { LayoutWithSidebar } from './layout-with-sidebar';

export const metadata: Metadata = {
  title: 'Doable Tasks',
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
          <LayoutWithSidebar>{children}</LayoutWithSidebar>
          <Toaster />
        </body>
      </UserProvider>
    </html>
  );
}
