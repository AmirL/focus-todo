import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the capacitor module before importing the bridge
const mockEnd = vi.fn().mockResolvedValue(undefined);
const mockStart = vi.fn().mockResolvedValue({ activityId: 'test-123' });
const mockUpdate = vi.fn().mockResolvedValue(undefined);
const mockRemove = vi.fn();
const mockAddListener = vi.fn().mockResolvedValue({ remove: mockRemove });
let mockIsNative = false;

vi.mock('@/shared/lib/capacitor', () => ({
  isNativeApp: () => mockIsNative,
  LiveActivity: {
    start: (...args: unknown[]) => mockStart(...args),
    end: (...args: unknown[]) => mockEnd(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    addListener: (...args: unknown[]) => mockAddListener(...args),
  },
}));

// Re-import after mocking to get fresh module state each test
let startLiveActivity: typeof import('./liveActivityBridge').startLiveActivity;
let endLiveActivity: typeof import('./liveActivityBridge').endLiveActivity;
let updateLiveActivity: typeof import('./liveActivityBridge').updateLiveActivity;
let getLiveActivityPushToken: typeof import('./liveActivityBridge').getLiveActivityPushToken;

beforeEach(async () => {
  vi.clearAllMocks();
  mockIsNative = false;
  // Re-import to reset module-level state (currentPushToken, listenerRemoveHandle)
  vi.resetModules();

  vi.doMock('@/shared/lib/capacitor', () => ({
    isNativeApp: () => mockIsNative,
    LiveActivity: {
      start: (...args: unknown[]) => mockStart(...args),
      end: (...args: unknown[]) => mockEnd(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
      addListener: (...args: unknown[]) => mockAddListener(...args),
    },
  }));

  const bridge = await import('./liveActivityBridge');
  startLiveActivity = bridge.startLiveActivity;
  endLiveActivity = bridge.endLiveActivity;
  updateLiveActivity = bridge.updateLiveActivity;
  getLiveActivityPushToken = bridge.getLiveActivityPushToken;
});

describe('liveActivityBridge', () => {
  describe('startLiveActivity', () => {
    it('no-ops when not running in a native app', async () => {
      mockIsNative = false;
      await startLiveActivity('Test Task');
      expect(mockEnd).not.toHaveBeenCalled();
      expect(mockStart).not.toHaveBeenCalled();
    });

    it('ends existing activity, adds listener, and starts new one', async () => {
      mockIsNative = true;
      await startLiveActivity('Test Task');

      expect(mockEnd).toHaveBeenCalledOnce();
      expect(mockAddListener).toHaveBeenCalledWith('pushTokenReceived', expect.any(Function));
      expect(mockStart).toHaveBeenCalledWith({ taskName: 'Test Task' });
    });

    it('removes previous listener before adding a new one', async () => {
      mockIsNative = true;
      await startLiveActivity('Task 1');
      expect(mockRemove).not.toHaveBeenCalled();

      await startLiveActivity('Task 2');
      expect(mockRemove).toHaveBeenCalledOnce();
    });

    it('captures push token from listener callback', async () => {
      mockIsNative = true;
      await startLiveActivity('Test Task');

      // Simulate the native plugin emitting a push token
      const listenerCallback = mockAddListener.mock.calls[0][1];
      listenerCallback({ token: 'abc12345deadbeef', activityId: 'test-123' });

      expect(getLiveActivityPushToken()).toBe('abc12345deadbeef');
    });
  });

  describe('endLiveActivity', () => {
    it('no-ops when not running in a native app', async () => {
      mockIsNative = false;
      await endLiveActivity();
      expect(mockEnd).not.toHaveBeenCalled();
    });

    it('ends the activity and cleans up the listener', async () => {
      mockIsNative = true;
      await startLiveActivity('Test Task');
      vi.clearAllMocks();

      await endLiveActivity();
      expect(mockEnd).toHaveBeenCalledOnce();
      expect(mockRemove).toHaveBeenCalledOnce();
    });

    it('sends APNs push when a push token is available', async () => {
      mockIsNative = true;
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response());

      await startLiveActivity('Test Task');
      // Simulate push token received
      const listenerCallback = mockAddListener.mock.calls[0][1];
      listenerCallback({ token: 'abc12345', activityId: 'test-123' });

      await endLiveActivity();

      expect(fetchSpy).toHaveBeenCalledWith('/api/live-activity-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pushToken: 'abc12345', isRunning: false }),
      });

      // Push token should be cleared after ending
      expect(getLiveActivityPushToken()).toBeNull();

      fetchSpy.mockRestore();
    });
  });

  describe('updateLiveActivity', () => {
    it('no-ops when not running in a native app', async () => {
      mockIsNative = false;
      await updateLiveActivity(true);
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('calls the native update method', async () => {
      mockIsNative = true;
      await updateLiveActivity(false);
      expect(mockUpdate).toHaveBeenCalledWith({ isRunning: false });
    });
  });

  describe('getLiveActivityPushToken', () => {
    it('returns null when no token has been received', () => {
      expect(getLiveActivityPushToken()).toBeNull();
    });
  });
});
