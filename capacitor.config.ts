import type { CapacitorConfig } from '@capacitor/cli';

// The iOS app uses a server.url to connect to the hosted web app, so all
// API calls, auth, and database access continue to work normally.
//
// To run in iOS Simulator during development:
//   1. Start the Next.js dev server: pnpm dev
//   2. Run: CAPACITOR_SERVER_URL=http://localhost:3000 npx cap run ios
//
// For production iOS builds:
//   Set CAPACITOR_SERVER_URL to the Vercel deployment URL, then run:
//   npx cap sync ios  and open ios/App/App.xcworkspace in Xcode.

const config: CapacitorConfig = {
  appId: 'com.focustodo.app',
  appName: 'Doable',
  // webDir is required by Capacitor CLI; server.url takes precedence for content.
  // capacitor-web/ holds a placeholder index.html so `cap sync` can run.
  webDir: 'capacitor-web',
  server: {
    // Provide CAPACITOR_SERVER_URL at sync time to connect to the live server.
    // e.g. CAPACITOR_SERVER_URL=http://localhost:3000 npx cap run ios
    url: process.env.CAPACITOR_SERVER_URL,
    cleartext: true,
    allowNavigation: ['*.vercel.app', 'localhost'],
  },
  ios: {
    scheme: 'Doable',
  },
};

export default config;
