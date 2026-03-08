import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { isFutureDate, isToday, isOverdue, parseDateFields, TaskDateKeys } from './utils';

dayjs.extend(utc);

describe('isFutureDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true for a date after end of today', () => {
    const futureDate = new Date('2024-06-17T00:00:00Z');
    expect(isFutureDate(futureDate)).toBe(true);
  });

  it('should return false for today', () => {
    const today = new Date('2024-06-15T12:00:00Z');
    expect(isFutureDate(today)).toBe(false);
  });

  it('should return false for today at a later time', () => {
    const laterToday = new Date('2024-06-15T18:00:00Z');
    expect(isFutureDate(laterToday)).toBe(false);
  });

  it('should return false for a date in the past', () => {
    const pastDate = new Date('2024-06-10T00:00:00Z');
    expect(isFutureDate(pastDate)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isFutureDate(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isFutureDate(undefined)).toBe(false);
  });

  it('should return true for tomorrow at start of day', () => {
    // dayjs().endOf('day') for 2024-06-15 is 2024-06-15T23:59:59.999
    // tomorrow at 00:00:00 is after that
    const tomorrow = new Date('2024-06-16T00:00:00Z');
    expect(isFutureDate(tomorrow)).toBe(true);
  });
});

describe('isToday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true for a date that is today', () => {
    const today = new Date('2024-06-15T08:00:00Z');
    expect(isToday(today)).toBe(true);
  });

  it('should return true for today at start of day', () => {
    const todayStart = new Date('2024-06-15T00:00:00Z');
    expect(isToday(todayStart)).toBe(true);
  });

  it('should return true for today at a later time', () => {
    const laterToday = new Date('2024-06-15T18:00:00Z');
    expect(isToday(laterToday)).toBe(true);
  });

  it('should return false for yesterday', () => {
    const yesterday = new Date('2024-06-14T12:00:00Z');
    expect(isToday(yesterday)).toBe(false);
  });

  it('should return false for tomorrow', () => {
    const tomorrow = new Date('2024-06-16T12:00:00Z');
    expect(isToday(tomorrow)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isToday(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isToday(undefined)).toBe(false);
  });
});

describe('isOverdue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true for a date in the past', () => {
    const pastDate = new Date('2024-06-14T00:00:00Z');
    expect(isOverdue(pastDate)).toBe(true);
  });

  it('should return true for a date several days in the past', () => {
    const pastDate = new Date('2024-06-10T00:00:00Z');
    expect(isOverdue(pastDate)).toBe(true);
  });

  it('should return false for today', () => {
    const today = new Date('2024-06-15T00:00:00Z');
    expect(isOverdue(today)).toBe(false);
  });

  it('should return false for a future date', () => {
    const futureDate = new Date('2024-06-16T00:00:00Z');
    expect(isOverdue(futureDate)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isOverdue(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isOverdue(undefined)).toBe(false);
  });
});

describe('TaskDateKeys', () => {
  it('should contain the expected date field names', () => {
    expect(TaskDateKeys).toContain('completedAt');
    expect(TaskDateKeys).toContain('date');
    expect(TaskDateKeys).toContain('selectedAt');
    expect(TaskDateKeys).toContain('deletedAt');
    expect(TaskDateKeys).toContain('updatedAt');
    expect(TaskDateKeys).toHaveLength(5);
  });
});

describe('parseDateFields', () => {
  it('should parse specified string fields into Date objects using UTC', () => {
    const obj = {
      completedAt: '2024-06-15 12:00:00',
      date: '2024-06-15 00:00:00',
      name: 'Test Task',
    };

    const parsed = parseDateFields(obj, ['completedAt', 'date'] as const);

    expect(parsed.completedAt).toBeInstanceOf(Date);
    expect(parsed.date).toBeInstanceOf(Date);
    expect(parsed.name).toBe('Test Task');
  });

  it('should parse dates as UTC', () => {
    const obj = {
      completedAt: '2024-06-15 12:00:00',
    };

    const parsed = parseDateFields(obj, ['completedAt'] as const);
    const date = parsed.completedAt as unknown as Date;

    expect(date.toISOString()).toBe('2024-06-15T12:00:00.000Z');
  });

  it('should not modify falsy fields', () => {
    const obj = {
      completedAt: null as string | null,
      date: '' as string,
      selectedAt: undefined as string | undefined,
      name: 'Test',
    };

    const parsed = parseDateFields(obj, ['completedAt', 'selectedAt'] as const);

    expect(parsed.completedAt).toBeNull();
    expect(parsed.selectedAt).toBeUndefined();
  });

  it('should not modify fields not in the fields list', () => {
    const obj = {
      completedAt: '2024-06-15 12:00:00',
      name: 'Test Task',
      listId: 1,
    };

    const parsed = parseDateFields(obj, ['completedAt'] as const);

    expect(parsed.completedAt).toBeInstanceOf(Date);
    expect(parsed.name).toBe('Test Task');
    expect(parsed.listId).toBe(1);
  });

  it('should return a new object without mutating the original', () => {
    const obj = {
      completedAt: '2024-06-15 12:00:00',
    };

    const parsed = parseDateFields(obj, ['completedAt'] as const);

    expect(parsed).not.toBe(obj);
    expect(obj.completedAt).toBe('2024-06-15 12:00:00');
  });

  it('should handle an empty fields list', () => {
    const obj = {
      completedAt: '2024-06-15 12:00:00',
      name: 'Test',
    };

    const parsed = parseDateFields(obj, [] as const);

    expect(parsed.completedAt).toBe('2024-06-15 12:00:00');
    expect(parsed.name).toBe('Test');
  });

  it('should work with TaskDateKeys for a full task-like object', () => {
    const obj = {
      id: 'task-1',
      name: 'Test Task',
      completedAt: '2024-06-15 12:00:00',
      date: '2024-06-15 00:00:00',
      selectedAt: '2024-06-15 08:00:00',
      deletedAt: null as string | null,
      updatedAt: '2024-06-15 10:00:00',
    };

    const parsed = parseDateFields(obj, TaskDateKeys);

    expect(parsed.completedAt).toBeInstanceOf(Date);
    expect(parsed.date).toBeInstanceOf(Date);
    expect(parsed.selectedAt).toBeInstanceOf(Date);
    expect(parsed.deletedAt).toBeNull();
    expect(parsed.updatedAt).toBeInstanceOf(Date);
    expect(parsed.id).toBe('task-1');
    expect(parsed.name).toBe('Test Task');
  });
});
