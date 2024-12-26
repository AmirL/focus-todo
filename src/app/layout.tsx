import type { Metadata } from 'next';
import './globals.css';

import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Toaster } from 'react-hot-toast';

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
          {children}
          <Toaster />
        </body>
      </UserProvider>
    </html>
  );
}
