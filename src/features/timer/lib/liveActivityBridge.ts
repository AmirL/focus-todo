import { isNativeApp, LiveActivity } from '@/shared/lib/capacitor';

/** Stores the most recent APNs push token for the active Live Activity */
let currentPushToken: string | null = null;

/**
 * Starts a Live Activity for the given task.
 * Listens for the APNs push token so background updates can be sent.
 * No-ops silently when running in a browser (non-native).
 */
export async function startLiveActivity(taskName: string): Promise<void> {
  if (!isNativeApp()) return;

  try {
    // End any existing activity before starting a new one
    await LiveActivity.end();

    // Listen for the push token emitted by the native plugin
    await LiveActivity.addListener('pushTokenReceived', (data) => {
      currentPushToken = data.token;
      console.log('[LiveActivity] Push token received:', data.token.slice(0, 8) + '...');
    });

    await LiveActivity.start({ taskName });
  } catch (error) {
    console.warn('[LiveActivity] Failed to start:', error);
  }
}

/**
 * Ends all running Live Activities (locally and via APNs for background).
 * No-ops silently when running in a browser (non-native).
 */
export async function endLiveActivity(): Promise<void> {
  if (!isNativeApp()) return;

  try {
    await LiveActivity.end();

    // Also send an APNs push to end the activity if it's in the background.
    // This is fire-and-forget; failure is non-critical since the local end
    // already dismissed the activity in the foreground case.
    if (currentPushToken) {
      sendApnsPush(currentPushToken, false).catch(() => {});
      currentPushToken = null;
    }
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

/** Returns the current APNs push token, if available */
export function getLiveActivityPushToken(): string | null {
  return currentPushToken;
}

async function sendApnsPush(pushToken: string, isRunning: boolean): Promise<void> {
  try {
    await fetch('/api/live-activity-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pushToken, isRunning }),
    });
  } catch {
    // Non-critical; the local ActivityKit call handles the foreground case
  }
}
