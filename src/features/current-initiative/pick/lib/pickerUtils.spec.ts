import { describe, it, expect, vi } from 'vitest';
import { getDaysLabel, calculateDaysSinceLastUsed, NEGLECT_THRESHOLD_DAYS } from './pickerUtils';

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

describe('pickerUtils', () => {
  describe('NEGLECT_THRESHOLD_DAYS', () => {
    it('is 5', () => {
      expect(NEGLECT_THRESHOLD_DAYS).toBe(5);
    });
  });

  describe('getDaysLabel', () => {
    it('returns "never used" for null', () => {
      expect(getDaysLabel(null)).toBe('never used');
    });

    it('returns "today" for 0', () => {
      expect(getDaysLabel(0)).toBe('today');
    });

    it('returns "yesterday" for 1', () => {
      expect(getDaysLabel(1)).toBe('yesterday');
    });

    it('returns "Nd ago" for values > 1', () => {
      expect(getDaysLabel(3)).toBe('3d ago');
      expect(getDaysLabel(10)).toBe('10d ago');
    });
  });

  describe('calculateDaysSinceLastUsed', () => {
    it('returns null for null input', () => {
      expect(calculateDaysSinceLastUsed(null)).toBeNull();
    });

    it('returns 0 for today', () => {
      expect(calculateDaysSinceLastUsed('2026-03-19')).toBe(0);
    });

    it('returns 1 for yesterday', () => {
      expect(calculateDaysSinceLastUsed('2026-03-18')).toBe(1);
    });

    it('returns correct number for past dates', () => {
      expect(calculateDaysSinceLastUsed('2026-03-09')).toBe(10);
    });
  });
});
