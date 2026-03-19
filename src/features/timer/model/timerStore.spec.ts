import { describe, it, expect, beforeEach } from 'vitest';
import { useTimerStore } from './timerStore';
import type { TimeEntry } from '@/shared/api/time-entries';

function makeMockEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    taskId: 10,
    userId: 'user-1',
    startedAt: '2026-03-19T09:00:00Z',
    endedAt: '2026-03-19T10:00:00Z',
    durationMinutes: 60,
    createdAt: '2026-03-19T09:00:00Z',
    ...overrides,
  };
}

describe('useTimerStore', () => {
  beforeEach(() => {
    useTimerStore.setState({ activeEntry: null });
  });

  it('has null activeEntry initially', () => {
    const state = useTimerStore.getState();
    expect(state.activeEntry).toBeNull();
  });

  it('setActiveEntry sets the active entry', () => {
    const entry = makeMockEntry({ id: 42, taskId: 5 });

    useTimerStore.getState().setActiveEntry(entry);

    const state = useTimerStore.getState();
    expect(state.activeEntry).toEqual(entry);
    expect(state.activeEntry!.id).toBe(42);
    expect(state.activeEntry!.taskId).toBe(5);
  });

  it('setActiveEntry with null clears the entry', () => {
    const entry = makeMockEntry();
    useTimerStore.getState().setActiveEntry(entry);
    expect(useTimerStore.getState().activeEntry).not.toBeNull();

    useTimerStore.getState().setActiveEntry(null);

    expect(useTimerStore.getState().activeEntry).toBeNull();
  });

  it('setActiveEntry replaces previous entry', () => {
    const entry1 = makeMockEntry({ id: 1, taskId: 10 });
    const entry2 = makeMockEntry({ id: 2, taskId: 20 });

    useTimerStore.getState().setActiveEntry(entry1);
    expect(useTimerStore.getState().activeEntry!.id).toBe(1);

    useTimerStore.getState().setActiveEntry(entry2);
    expect(useTimerStore.getState().activeEntry!.id).toBe(2);
    expect(useTimerStore.getState().activeEntry!.taskId).toBe(20);
  });

  it('handles running entry (no endedAt)', () => {
    const runningEntry = makeMockEntry({
      id: 3,
      endedAt: null,
      durationMinutes: null,
    });

    useTimerStore.getState().setActiveEntry(runningEntry);

    const state = useTimerStore.getState();
    expect(state.activeEntry!.endedAt).toBeNull();
    expect(state.activeEntry!.durationMinutes).toBeNull();
  });
});
