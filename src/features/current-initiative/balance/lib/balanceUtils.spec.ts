import { describe, it, expect, vi } from 'vitest';
import { getDaysAgoLabel, calculateDaysSince, NEGLECT_THRESHOLD_DAYS } from './balanceUtils';

// Mock dayjs to control "today"
const MOCK_TODAY = '2026-03-19';

vi.mock('dayjs', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual: any = await vi.importActual('dayjs');
  const realDayjs = actual.default ?? actual;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockDayjs = (...args: any[]) => {
    if (args.length === 0) return realDayjs(MOCK_TODAY);
    return realDayjs(...args);
  };
  Object.assign(mockDayjs, realDayjs);
  return { default: mockDayjs };
});

describe('balanceUtils', () => {
  describe('NEGLECT_THRESHOLD_DAYS', () => {
    it('is 5', () => {
      expect(NEGLECT_THRESHOLD_DAYS).toBe(5);
    });
  });

  describe('getDaysAgoLabel', () => {
    it('returns "never" for null', () => {
      expect(getDaysAgoLabel(null)).toBe('never');
    });

    it('returns "today" when last used today', () => {
      expect(getDaysAgoLabel('2026-03-19')).toBe('today');
    });

    it('returns "1 day ago" for yesterday', () => {
      expect(getDaysAgoLabel('2026-03-18')).toBe('1 day ago');
    });

    it('returns "N days ago" for multiple days', () => {
      expect(getDaysAgoLabel('2026-03-14')).toBe('5 days ago');
    });

    it('returns correct label for dates far in the past', () => {
      expect(getDaysAgoLabel('2026-02-19')).toBe('28 days ago');
    });
  });

  describe('calculateDaysSince', () => {
    it('returns null for null input', () => {
      expect(calculateDaysSince(null)).toBeNull();
    });

    it('returns 0 for today', () => {
      expect(calculateDaysSince('2026-03-19')).toBe(0);
    });

    it('returns 1 for yesterday', () => {
      expect(calculateDaysSince('2026-03-18')).toBe(1);
    });

    it('returns correct number for past dates', () => {
      expect(calculateDaysSince('2026-03-12')).toBe(7);
    });
  });
});
