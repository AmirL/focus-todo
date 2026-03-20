import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import {
  getLocalDayjs,
  calculateDiffMinutes,
  formatTimerDuration,
  calculateTaskTimeSpent,
  findRunningEntry,
  isTimerRunningForTask,
  getTimerTaskName,
} from './timerUtils';
import type { TimeEntry } from '@/shared/api/time-entries';

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 1,
    taskId: 100,
    userId: 'user-1',
    startedAt: '2026-03-20T09:00:00.000Z',
    endedAt: '2026-03-20T10:00:00.000Z',
    durationMinutes: 60,
    createdAt: '2026-03-20T09:00:00.000Z',
    ...overrides,
  };
}

describe('getLocalDayjs', () => {
  it('parses a valid HH:mm time onto the base date', () => {
    const result = getLocalDayjs('2026-03-20T09:00:00.000Z', '14:30');
    expect(result.hour()).toBe(14);
    expect(result.minute()).toBe(30);
    expect(result.second()).toBe(0);
  });

  it('returns base dayjs for invalid time string', () => {
    const result = getLocalDayjs('2026-03-20T09:00:00.000Z', 'invalid');
    expect(result.hour()).toBe(dayjs('2026-03-20T09:00:00.000Z').hour());
  });

  it('returns base dayjs for empty string', () => {
    const result = getLocalDayjs('2026-03-20T09:00:00.000Z', '');
    expect(result.isValid()).toBe(true);
  });

  it('handles midnight correctly', () => {
    const result = getLocalDayjs('2026-03-20T09:00:00.000Z', '00:00');
    expect(result.hour()).toBe(0);
    expect(result.minute()).toBe(0);
  });
});

describe('calculateDiffMinutes', () => {
  it('calculates difference in minutes', () => {
    const start = dayjs('2026-03-20T09:00:00.000Z');
    const end = dayjs('2026-03-20T10:30:00.000Z');
    expect(calculateDiffMinutes(start, end)).toBe(90);
  });

  it('returns 0 when end is before start', () => {
    const start = dayjs('2026-03-20T10:00:00.000Z');
    const end = dayjs('2026-03-20T09:00:00.000Z');
    expect(calculateDiffMinutes(start, end)).toBe(0);
  });

  it('returns 0 for same time', () => {
    const time = dayjs('2026-03-20T09:00:00.000Z');
    expect(calculateDiffMinutes(time, time)).toBe(0);
  });
});

describe('formatTimerDuration', () => {
  it('formats minutes only when less than 60', () => {
    expect(formatTimerDuration(45)).toBe('45m');
  });

  it('formats hours and minutes', () => {
    expect(formatTimerDuration(90)).toBe('1h 30m');
  });

  it('formats zero minutes', () => {
    expect(formatTimerDuration(0)).toBe('0m');
  });

  it('formats exact hours', () => {
    expect(formatTimerDuration(120)).toBe('2h 0m');
  });

  it('formats large durations', () => {
    expect(formatTimerDuration(500)).toBe('8h 20m');
  });
});

describe('calculateTaskTimeSpent', () => {
  it('sums duration for matching task entries', () => {
    const entries = [
      makeEntry({ taskId: 100, durationMinutes: 30 }),
      makeEntry({ taskId: 100, durationMinutes: 45 }),
      makeEntry({ taskId: 200, durationMinutes: 60 }),
    ];
    expect(calculateTaskTimeSpent(entries, 100)).toBe(75);
  });

  it('returns 0 when no entries match', () => {
    const entries = [makeEntry({ taskId: 200, durationMinutes: 30 })];
    expect(calculateTaskTimeSpent(entries, 100)).toBe(0);
  });

  it('handles entries with null durationMinutes', () => {
    const entries = [
      makeEntry({ taskId: 100, durationMinutes: 30 }),
      makeEntry({ taskId: 100, durationMinutes: null as unknown as number }),
    ];
    expect(calculateTaskTimeSpent(entries, 100)).toBe(30);
  });

  it('returns 0 for empty entries', () => {
    expect(calculateTaskTimeSpent([], 100)).toBe(0);
  });
});

describe('findRunningEntry', () => {
  it('returns the entry without endedAt', () => {
    const entries = [
      makeEntry({ id: 1, endedAt: '2026-03-20T10:00:00.000Z' }),
      makeEntry({ id: 2, endedAt: null }),
      makeEntry({ id: 3, endedAt: '2026-03-20T11:00:00.000Z' }),
    ];
    const result = findRunningEntry(entries);
    expect(result).toBeDefined();
    expect(result!.id).toBe(2);
  });

  it('returns undefined when all entries have endedAt', () => {
    const entries = [
      makeEntry({ endedAt: '2026-03-20T10:00:00.000Z' }),
    ];
    expect(findRunningEntry(entries)).toBeUndefined();
  });

  it('returns undefined for empty array', () => {
    expect(findRunningEntry([])).toBeUndefined();
  });
});

describe('isTimerRunningForTask', () => {
  it('returns true when active entry matches task and is running', () => {
    const entry = makeEntry({ taskId: 100, endedAt: null });
    expect(isTimerRunningForTask(entry, 100)).toEqual(true);
  });

  it('returns false when active entry matches task but is stopped', () => {
    const entry = makeEntry({ taskId: 100, endedAt: '2026-03-20T10:00:00.000Z' });
    expect(isTimerRunningForTask(entry, 100)).toEqual(false);
  });

  it('returns false when active entry is for different task', () => {
    const entry = makeEntry({ taskId: 200, endedAt: null });
    expect(isTimerRunningForTask(entry, 100)).toEqual(false);
  });

  it('returns false when no active entry', () => {
    expect(isTimerRunningForTask(null, 100)).toEqual(false);
  });
});

describe('getTimerTaskName', () => {
  it('returns task name when found', () => {
    const tasks = [{ id: 100, name: 'Write tests' }];
    expect(getTimerTaskName(tasks, 100)).toEqual('Write tests');
  });

  it('returns fallback when task not found', () => {
    const tasks = [{ id: 200, name: 'Other task' }];
    expect(getTimerTaskName(tasks, 100)).toEqual('Task #100');
  });

  it('returns fallback when tasks is undefined', () => {
    expect(getTimerTaskName(undefined, 100)).toEqual('Task #100');
  });
});
