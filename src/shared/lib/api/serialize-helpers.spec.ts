import { describe, it, expect } from 'vitest';
import { toISOString } from './serialize-helpers';

describe('toISOString', () => {
  it('should convert a Date object to ISO string', () => {
    const date = new Date('2024-06-15T12:00:00Z');
    expect(toISOString(date)).toBe('2024-06-15T12:00:00.000Z');
  });

  it('should convert a valid date string to ISO string', () => {
    expect(toISOString('2024-06-15T12:00:00Z')).toBe('2024-06-15T12:00:00.000Z');
  });

  it('should convert a date string without timezone to ISO string', () => {
    const result = toISOString('2024-06-15');
    expect(result).toBeTruthy();
    expect(result).toContain('2024-06-15');
  });

  it('should return null for null input', () => {
    expect(toISOString(null)).toBeNull();
  });

  it('should return null for undefined input', () => {
    expect(toISOString(undefined)).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(toISOString('')).toBeNull();
  });

  it('should return null for invalid date string', () => {
    expect(toISOString('not-a-date')).toBeNull();
  });

  it('should return null for completely invalid string', () => {
    expect(toISOString('abc123xyz')).toBeNull();
  });

  it('should handle Date object at epoch', () => {
    const date = new Date(0);
    expect(toISOString(date)).toBe('1970-01-01T00:00:00.000Z');
  });
});
