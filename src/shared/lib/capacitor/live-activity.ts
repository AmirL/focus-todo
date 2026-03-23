import { registerPlugin } from '@capacitor/core';

export interface LiveActivityPlugin {
  /** Start a Live Activity for the given task */
  start(options: { taskName: string }): Promise<{ activityId: string }>;
  /** Update the Live Activity state */
  update(options: { isRunning: boolean }): Promise<void>;
  /** End all running Live Activities */
  end(): Promise<void>;
  /** Listen for push token updates from ActivityKit */
  addListener(
    eventName: 'pushTokenReceived',
    callback: (data: { token: string; activityId: string }) => void,
  ): Promise<{ remove: () => void }>;
}

export const LiveActivity = registerPlugin<LiveActivityPlugin>('LiveActivity');
