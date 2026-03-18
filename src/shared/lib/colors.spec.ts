import { describe, it, expect } from 'vitest';
import { LIST_COLORS, isValidListColor, validateListColor } from './colors';

describe('LIST_COLORS', () => {
  it('should contain expected colors', () => {
    expect(LIST_COLORS).toContain('blue');
    expect(LIST_COLORS).toContain('violet');
    expect(LIST_COLORS).toContain('emerald');
    expect(LIST_COLORS).toContain('orange');
    expect(LIST_COLORS).toContain('red');
    expect(LIST_COLORS).toContain('pink');
    expect(LIST_COLORS).toContain('cyan');
    expect(LIST_COLORS).toContain('yellow');
  });

  it('should have 10 colors', () => {
    expect(LIST_COLORS).toHaveLength(10);
  });
});

describe('isValidListColor', () => {
  it('should return true for valid colors', () => {
    expect(isValidListColor('blue')).toBe(true);
    expect(isValidListColor('violet')).toBe(true);
    expect(isValidListColor('emerald')).toBe(true);
  });

  it('should return false for invalid colors', () => {
    expect(isValidListColor('purple')).toBe(false);
    expect(isValidListColor('GREEN')).toBe(false);
    expect(isValidListColor('')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isValidListColor(123)).toBe(false);
    expect(isValidListColor(null)).toBe(false);
    expect(isValidListColor(undefined)).toBe(false);
    expect(isValidListColor(true)).toBe(false);
  });
});

describe('validateListColor', () => {
  it('should accept null', () => {
    const result = validateListColor(null);
    expect(result.isValid).toBe(true);
  });

  it('should accept undefined', () => {
    const result = validateListColor(undefined);
    expect(result.isValid).toBe(true);
  });

  it('should accept valid color names', () => {
    for (const color of LIST_COLORS) {
      const result = validateListColor(color);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    }
  });

  it('should reject invalid color names', () => {
    const result = validateListColor('purple');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid color');
    expect(result.error).toContain('blue');
  });

  it('should reject non-string values', () => {
    const result = validateListColor(42);
    expect(result.isValid).toBe(false);
  });
});
