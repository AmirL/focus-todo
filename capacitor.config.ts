import type { CapacitorConfig } from '@capacitor/cli';

// The iOS app uses a server.url to connect to the hosted web app, so all
// API calls, auth, and database access continue to work normally.
//
// To run in iOS Simulator during development:
//   1. Start the Next.js dev server: pnpm dev
//   2. Run: CAPACITOR_SERVER_URL=http://localhost:3000 npx cap run ios
//
// For production iOS builds (default, no env var needed):
//   npx cap sync ios  and open ios/App/App.xcworkspace in Xcode.
//   The app will load https://doable-tasks.vercel.app.

const config: CapacitorConfig = {
  appId: 'com.focustodo.app',
  appName: 'Doable',
  // webDir is required by Capacitor CLI; server.url takes precedence for content.
  // capacitor-web/ holds a placeholder index.html so `cap sync` can run.
  webDir: 'capacitor-web',
  server: {
    // Defaults to the production Vercel URL. Override with CAPACITOR_SERVER_URL
    // to connect to a local dev server: e.g. CAPACITOR_SERVER_URL=http://localhost:3000 npx cap run ios
    url: process.env.CAPACITOR_SERVER_URL ?? 'https://doable-tasks.vercel.app',
    cleartext: true,
    allowNavigation: ['*.vercel.app', 'localhost'],
  },
  ios: {
    scheme: 'Doable',
  },
};

export default config;
