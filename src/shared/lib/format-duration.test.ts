import { describe, it, expect } from 'vitest';
import { formatDuration, formatTotalDuration } from '@/shared/lib/format-duration';

describe('formatDuration', () => {
  it('should return null for null input', () => {
    expect(formatDuration(null)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(formatDuration(undefined)).toBeNull();
  });

  it('should return null for zero minutes', () => {
    expect(formatDuration(0)).toBeNull();
  });

  it('should return null for negative minutes', () => {
    expect(formatDuration(-10)).toBeNull();
  });

  // Special case: 15 minutes
  it('should format 15 minutes as "15m"', () => {
    expect(formatDuration(15)).toBe('15m');
  });

  // Special case: 30 minutes
  it('should format 30 minutes as "30m"', () => {
    expect(formatDuration(30)).toBe('30m');
  });

  // Special case: 60 minutes
  it('should format 60 minutes as "1h"', () => {
    expect(formatDuration(60)).toBe('1h');
  });

  // Special case: 90 minutes
  it('should format 90 minutes as "1.5h"', () => {
    expect(formatDuration(90)).toBe('1.5h');
  });

  // Special case: 150 minutes
  it('should format 150 minutes as "2.5h"', () => {
    expect(formatDuration(150)).toBe('2.5h');
  });

  // Special case: 240 minutes
  it('should format 240 minutes as "4h"', () => {
    expect(formatDuration(240)).toBe('4h');
  });

  // Special case: 480 minutes (full day)
  it('should format 480 minutes as "1d"', () => {
    expect(formatDuration(480)).toBe('1d');
  });

  // Special case: 390 minutes (also 1 day)
  it('should format 390 minutes as "1d"', () => {
    expect(formatDuration(390)).toBe('1d');
  });

  // Generic formatting: minutes only (less than an hour)
  it('should format 5 minutes as "5m"', () => {
    expect(formatDuration(5)).toBe('5m');
  });

  it('should format 45 minutes as "45m"', () => {
    expect(formatDuration(45)).toBe('45m');
  });

  // Generic formatting: exact hours
  it('should format 120 minutes as "2h"', () => {
    expect(formatDuration(120)).toBe('2h');
  });

  it('should format 180 minutes as "3h"', () => {
    expect(formatDuration(180)).toBe('3h');
  });

  // Generic formatting: hours and minutes
  it('should format 75 minutes as "1h 15m"', () => {
    expect(formatDuration(75)).toBe('1h 15m');
  });

  it('should format 100 minutes as "1h 40m"', () => {
    expect(formatDuration(100)).toBe('1h 40m');
  });

  it('should format 200 minutes as "3h 20m"', () => {
    expect(formatDuration(200)).toBe('3h 20m');
  });
});

describe('formatTotalDuration', () => {
  it('should return empty string for 0 minutes', () => {
    expect(formatTotalDuration(0)).toBe('');
  });

  it('should return formatted duration for positive minutes', () => {
    expect(formatTotalDuration(60)).toBe('1h');
  });

  it('should return formatted duration for 30 minutes', () => {
    expect(formatTotalDuration(30)).toBe('30m');
  });

  it('should return formatted duration for mixed hours and minutes', () => {
    expect(formatTotalDuration(75)).toBe('1h 15m');
  });
});
