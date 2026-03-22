import { isNativeApp, LiveActivity } from '@/shared/lib/capacitor';

/**
 * Starts a Live Activity for the given task.
 * No-ops silently when running in a browser (non-native).
 */
export async function startLiveActivity(taskName: string): Promise<void> {
  if (!isNativeApp()) return;

  try {
    // End any existing activity before starting a new one
    await LiveActivity.end();
    await LiveActivity.start({ taskName });
  } catch (error) {
    console.warn('[LiveActivity] Failed to start:', error);
  }
}

/**
 * Ends all running Live Activities.
 * No-ops silently when running in a browser (non-native).
 */
export async function endLiveActivity(): Promise<void> {
  if (!isNativeApp()) return;

  try {
    await LiveActivity.end();
  } catch (error) {
    console.warn('[LiveActivity] Failed to end:', error);
  }
}

/**
 * Updates the Live Activity state (e.g., pause/resume).
 * No-ops silently when running in a browser (non-native).
 */
export async function updateLiveActivity(isRunning: boolean): Promise<void> {
  if (!isNativeApp()) return;

  try {
    await LiveActivity.update({ isRunning });
  } catch (error) {
    console.warn('[LiveActivity] Failed to update:', error);
  }
}
