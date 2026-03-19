import { describe, it, expect, vi } from 'vitest';
import { formatHistoryDate } from './historyUtils';

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

describe('formatHistoryDate', () => {
  it('returns "Today" for today\'s date string', () => {
    expect(formatHistoryDate('2026-03-19')).toBe('Today');
  });

  it('returns "Today" for today\'s Date object', () => {
    expect(formatHistoryDate(new Date('2026-03-19T12:00:00'))).toBe('Today');
  });

  it('returns "Yesterday" for yesterday\'s date', () => {
    expect(formatHistoryDate('2026-03-18')).toBe('Yesterday');
  });

  it('returns formatted date for older dates', () => {
    expect(formatHistoryDate('2026-03-10')).toBe('Mar 10');
  });

  it('returns formatted date for dates in a different month', () => {
    expect(formatHistoryDate('2026-02-15')).toBe('Feb 15');
  });

  it('handles Date objects for older dates', () => {
    expect(formatHistoryDate(new Date('2026-01-05T00:00:00'))).toBe('Jan 5');
  });
});
