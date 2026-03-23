import { Capacitor } from '@capacitor/core';

/** Returns true when running inside the native iOS Capacitor shell */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export { LiveActivity } from './live-activity';
export type { LiveActivityPlugin } from './live-activity';
