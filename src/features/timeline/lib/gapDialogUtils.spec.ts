import { describe, it, expect } from 'vitest';
import {
  formatTimeInput,
  formatGapDuration,
  parseTimeToDate,
  computeGapDuration,
  isValidGapSubmission,
  buildGapTaskPayload,
  buildTimeRange,
} from './gapDialogUtils';

describe('formatTimeInput', () => {
  it('formats an ISO string to HH:mm', () => {
    // Use a fixed date to avoid timezone issues
    const date = new Date(2026, 2, 20, 9, 5); // March 20, 2026 09:05
    expect(formatTimeInput(date.toISOString())).toBe('09:05');
  });

  it('pads single-digit hours and minutes', () => {
    const date = new Date(2026, 0, 1, 3, 7);
    expect(formatTimeInput(date.toISOString())).toBe('03:07');
  });

  it('handles midnight', () => {
    const date = new Date(2026, 0, 1, 0, 0);
    expect(formatTimeInput(date.toISOString())).toBe('00:00');
  });

  it('handles end of day', () => {
    const date = new Date(2026, 0, 1, 23, 59);
    expect(formatTimeInput(date.toISOString())).toBe('23:59');
  });
});

describe('formatGapDuration', () => {
  it('formats minutes under an hour', () => {
    expect(formatGapDuration(30)).toBe('30m');
    expect(formatGapDuration(1)).toBe('1m');
    expect(formatGapDuration(59)).toBe('59m');
  });

  it('formats exact hours', () => {
    expect(formatGapDuration(60)).toBe('1h');
    expect(formatGapDuration(120)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatGapDuration(90)).toBe('1h 30m');
    expect(formatGapDuration(150)).toBe('2h 30m');
    expect(formatGapDuration(61)).toBe('1h 1m');
  });
});

describe('parseTimeToDate', () => {
  it('parses HH:mm onto reference date', () => {
    const ref = new Date(2026, 2, 20, 0, 0);
    const result = parseTimeToDate('14:30', ref);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
    expect(result.getDate()).toBe(20);
  });

  it('preserves the reference date', () => {
    const ref = new Date(2026, 5, 15, 8, 0);
    const result = parseTimeToDate('09:00', ref);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
  });
});

describe('computeGapDuration', () => {
  const ref = new Date(2026, 2, 20, 0, 0);

  it('computes positive duration', () => {
    expect(computeGapDuration('09:00', '10:30', ref)).toBe(90);
  });

  it('returns null for empty start time', () => {
    expect(computeGapDuration('', '10:00', ref)).toBeNull();
  });

  it('returns null for empty end time', () => {
    expect(computeGapDuration('09:00', '', ref)).toBeNull();
  });

  it('returns null for zero duration', () => {
    expect(computeGapDuration('09:00', '09:00', ref)).toBeNull();
  });

  it('returns null for negative duration', () => {
    expect(computeGapDuration('10:00', '09:00', ref)).toBeNull();
  });
});

describe('isValidGapSubmission', () => {
  const ref = new Date(2026, 2, 20, 0, 0);

  it('returns true for valid submission', () => {
    expect(isValidGapSubmission('Task name', 1, '09:00', '10:00', ref)).toBe(true);
  });

  it('returns false for empty name', () => {
    expect(isValidGapSubmission('', 1, '09:00', '10:00', ref)).toBe(false);
    expect(isValidGapSubmission('   ', 1, '09:00', '10:00', ref)).toBe(false);
  });

  it('returns false for null list id', () => {
    expect(isValidGapSubmission('Task', null, '09:00', '10:00', ref)).toBe(false);
  });

  it('returns false when end is not after start', () => {
    expect(isValidGapSubmission('Task', 1, '10:00', '09:00', ref)).toBe(false);
    expect(isValidGapSubmission('Task', 1, '09:00', '09:00', ref)).toBe(false);
  });
});

describe('buildTimeRange', () => {
  it('preserves the local date when building ISO strings', () => {
    // Simulate a reference date where UTC date differs from local date.
    // E.g., March 24 at 01:00 AM in UTC+3 = March 23 at 22:00 UTC.
    // The bug: date.toISOString().split('T')[0] returns "2026-03-23" (UTC),
    // but the user is viewing March 24 (local).
    const ref = new Date(2026, 2, 24, 1, 0); // March 24, 01:00 local time
    const result = buildTimeRange('09:00', '10:00', ref);

    const start = new Date(result.startedAt);
    const end = new Date(result.endedAt);

    // The resulting dates must be on the same LOCAL day as the reference
    expect(start.getDate()).toBe(24);
    expect(start.getHours()).toBe(9);
    expect(start.getMinutes()).toBe(0);
    expect(end.getDate()).toBe(24);
    expect(end.getHours()).toBe(10);
    expect(end.getMinutes()).toBe(0);
  });

  it('works for mid-day reference dates', () => {
    const ref = new Date(2026, 2, 24, 15, 0); // March 24, 15:00
    const result = buildTimeRange('09:00', '17:00', ref);

    const start = new Date(result.startedAt);
    const end = new Date(result.endedAt);

    expect(start.getDate()).toBe(24);
    expect(start.getHours()).toBe(9);
    expect(end.getDate()).toBe(24);
    expect(end.getHours()).toBe(17);
  });
});

describe('buildGapTaskPayload', () => {
  it('builds correct payload', () => {
    const ref = new Date(2026, 2, 20, 0, 0);
    const result = buildGapTaskPayload('My task', 5, '09:00', '10:30', ref);

    expect(result.task.name).toBe('My task');
    expect(result.task.listId).toBe(5);
    expect(result.startedAt).toBeDefined();
    expect(result.endedAt).toBeDefined();

    const start = new Date(result.startedAt);
    const end = new Date(result.endedAt);
    expect(start.getHours()).toBe(9);
    expect(end.getHours()).toBe(10);
    expect(end.getMinutes()).toBe(30);
  });

  it('trims the task name', () => {
    const ref = new Date(2026, 2, 20, 0, 0);
    const result = buildGapTaskPayload('  My task  ', 1, '09:00', '10:00', ref);
    expect(result.task.name).toBe('My task');
  });
});
