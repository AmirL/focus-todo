import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isValidDate, toDate, parseCreateInitiativeBody } from './initiative-helpers';

describe('isValidDate', () => {
  it('should return true for valid YYYY-MM-DD format', () => {
    expect(isValidDate('2024-06-15')).toBe(true);
  });

  it('should return true for first day of month', () => {
    expect(isValidDate('2024-01-01')).toBe(true);
  });

  it('should return true for last day of month', () => {
    expect(isValidDate('2024-12-31')).toBe(true);
  });

  it('should return false for invalid format', () => {
    expect(isValidDate('06-15-2024')).toBe(false);
  });

  it('should return false for partial date', () => {
    expect(isValidDate('2024-06')).toBe(false);
  });

  it('should return false for obviously invalid date', () => {
    // dayjs strict mode catches truly invalid formats
    expect(isValidDate('abcd-ef-gh')).toBe(false);
  });

  it('should return false for non-date string', () => {
    expect(isValidDate('not-a-date')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidDate('')).toBe(false);
  });

  it('should return false for date with time', () => {
    expect(isValidDate('2024-06-15T12:00:00Z')).toBe(false);
  });

  it('should handle leap year correctly', () => {
    expect(isValidDate('2024-02-29')).toBe(true);
  });
});

describe('toDate', () => {
  it('should convert a YYYY-MM-DD string to a Date object', () => {
    const result = toDate('2024-06-15');
    expect(result).toBeInstanceOf(Date);
  });

  it('should preserve the date value', () => {
    const result = toDate('2024-01-01');
    expect(result.getFullYear()).toBe(2024);
    // Month is 0-indexed in JS Date
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);
  });
});

describe('parseCreateInitiativeBody', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return error when listId is missing', () => {
    const result = parseCreateInitiativeBody({});
    expect(result.error).toBe('listId must be a valid number');
  });

  it('should return error when listId is not a number', () => {
    const result = parseCreateInitiativeBody({ listId: 'abc' as unknown as number });
    expect(result.error).toBe('listId must be a valid number');
  });

  it('should return error when listId is NaN', () => {
    const result = parseCreateInitiativeBody({ listId: NaN });
    expect(result.error).toBe('listId must be a valid number');
  });

  it('should return error when listId is Infinity', () => {
    const result = parseCreateInitiativeBody({ listId: Infinity });
    expect(result.error).toBe('listId must be a valid number');
  });

  it('should return error when listId is 0', () => {
    const result = parseCreateInitiativeBody({ listId: 0 });
    expect(result.error).toBe('listId must be a valid number');
  });

  it('should return error when date is not a string', () => {
    const result = parseCreateInitiativeBody({ listId: 1, date: 123 as unknown as string });
    expect(result.error).toBe('date must be a string in YYYY-MM-DD format');
  });

  it('should return error when reason is not a string', () => {
    const result = parseCreateInitiativeBody({ listId: 1, reason: 123 as unknown as string });
    expect(result.error).toBe('reason must be a string');
  });

  it('should return error for invalid date format', () => {
    const result = parseCreateInitiativeBody({ listId: 1, date: 'not-a-date' });
    expect(result.error).toBe('Invalid date format. Use YYYY-MM-DD');
  });

  it('should return error for date that is not today or tomorrow', () => {
    const result = parseCreateInitiativeBody({ listId: 1, date: '2024-06-20' });
    expect(result.error).toBe('Can only set initiative for today or tomorrow');
  });

  it('should accept today as date', () => {
    const result = parseCreateInitiativeBody({ listId: 1, date: '2024-06-15' });
    expect(result.error).toBeUndefined();
    expect(result.listId).toBe(1);
    expect(result.date).toBe('2024-06-15');
  });

  it('should accept tomorrow as date', () => {
    const result = parseCreateInitiativeBody({ listId: 1, date: '2024-06-16' });
    expect(result.error).toBeUndefined();
    expect(result.listId).toBe(1);
    expect(result.date).toBe('2024-06-16');
  });

  it('should accept valid body without date and reason', () => {
    const result = parseCreateInitiativeBody({ listId: 5 });
    expect(result.error).toBeUndefined();
    expect(result.listId).toBe(5);
    expect(result.date).toBeUndefined();
    expect(result.reason).toBeUndefined();
  });

  it('should accept valid body with reason', () => {
    const result = parseCreateInitiativeBody({ listId: 1, reason: 'deadline coming' });
    expect(result.error).toBeUndefined();
    expect(result.reason).toBe('deadline coming');
  });

  it('should return error for past date', () => {
    const result = parseCreateInitiativeBody({ listId: 1, date: '2024-06-14' });
    expect(result.error).toBe('Can only set initiative for today or tomorrow');
  });
});
