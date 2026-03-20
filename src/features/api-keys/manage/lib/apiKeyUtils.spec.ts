import { describe, it, expect } from 'vitest';
import {
  filterActiveKeys,
  filterRevokedKeys,
  formatKeyIdentifier,
  getKeyDisplayName,
  sortKeysByDate,
  formatKeyDate,
  hasKeyBeenUsed,
} from './apiKeyUtils';
import type { ApiKeyItem } from '../model/types';

function makeKey(overrides: Partial<ApiKeyItem> = {}): ApiKeyItem {
  return {
    id: 1,
    name: 'My Key',
    prefix: 'dk_',
    lastFour: 'abcd',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastUsedAt: null,
    revokedAt: null,
    ...overrides,
  };
}

describe('filterActiveKeys', () => {
  it('returns only keys without revokedAt', () => {
    const keys = [
      makeKey({ id: 1, revokedAt: null }),
      makeKey({ id: 2, revokedAt: '2026-01-15T00:00:00.000Z' }),
      makeKey({ id: 3, revokedAt: null }),
    ];
    const active = filterActiveKeys(keys);
    expect(active).toHaveLength(2);
    expect(active.map((k) => k.id)).toEqual([1, 3]);
  });

  it('returns empty array when all keys are revoked', () => {
    const keys = [
      makeKey({ id: 1, revokedAt: '2026-01-15T00:00:00.000Z' }),
    ];
    expect(filterActiveKeys(keys)).toEqual([]);
  });

  it('returns all keys when none are revoked', () => {
    const keys = [makeKey({ id: 1 }), makeKey({ id: 2 })];
    expect(filterActiveKeys(keys)).toHaveLength(2);
  });

  it('returns empty array for empty input', () => {
    expect(filterActiveKeys([])).toEqual([]);
  });
});

describe('filterRevokedKeys', () => {
  it('returns only keys with revokedAt', () => {
    const keys = [
      makeKey({ id: 1, revokedAt: null }),
      makeKey({ id: 2, revokedAt: '2026-01-15T00:00:00.000Z' }),
      makeKey({ id: 3, revokedAt: '2026-02-01T00:00:00.000Z' }),
    ];
    const revoked = filterRevokedKeys(keys);
    expect(revoked).toHaveLength(2);
    expect(revoked.map((k) => k.id)).toEqual([2, 3]);
  });

  it('returns empty array when no keys are revoked', () => {
    const keys = [makeKey({ id: 1, revokedAt: null })];
    expect(filterRevokedKeys(keys)).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(filterRevokedKeys([])).toEqual([]);
  });
});

describe('formatKeyIdentifier', () => {
  it('formats key with prefix and lastFour', () => {
    const key = makeKey({ prefix: 'dk_', lastFour: '7xyz' });
    expect(formatKeyIdentifier(key)).toBe('dk_...7xyz');
  });
});

describe('getKeyDisplayName', () => {
  it('returns the key name when set', () => {
    const key = makeKey({ name: 'Production Key' });
    expect(getKeyDisplayName(key)).toBe('Production Key');
  });

  it('returns "Unnamed key" when name is null', () => {
    const key = makeKey({ name: null });
    expect(getKeyDisplayName(key)).toBe('Unnamed key');
  });
});

describe('sortKeysByDate', () => {
  it('sorts keys newest first', () => {
    const keys = [
      makeKey({ id: 1, createdAt: '2026-01-01T00:00:00.000Z' }),
      makeKey({ id: 2, createdAt: '2026-03-01T00:00:00.000Z' }),
      makeKey({ id: 3, createdAt: '2026-02-01T00:00:00.000Z' }),
    ];
    const sorted = sortKeysByDate(keys);
    expect(sorted.map((k) => k.id)).toEqual([2, 3, 1]);
  });

  it('does not mutate original array', () => {
    const keys = [
      makeKey({ id: 1, createdAt: '2026-01-01T00:00:00.000Z' }),
      makeKey({ id: 2, createdAt: '2026-03-01T00:00:00.000Z' }),
    ];
    const original = [...keys];
    sortKeysByDate(keys);
    expect(keys.map((k) => k.id)).toEqual(original.map((k) => k.id));
  });

  it('returns empty array for empty input', () => {
    expect(sortKeysByDate([])).toEqual([]);
  });

  it('handles Date objects as createdAt', () => {
    const keys = [
      makeKey({ id: 1, createdAt: new Date('2026-01-01') }),
      makeKey({ id: 2, createdAt: new Date('2026-03-01') }),
    ];
    const sorted = sortKeysByDate(keys);
    expect(sorted[0].id).toBe(2);
  });
});

describe('formatKeyDate', () => {
  it('formats a date string', () => {
    const result = formatKeyDate('2026-03-15T00:00:00.000Z');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2026');
  });

  it('formats a Date object', () => {
    const result = formatKeyDate(new Date('2026-01-01'));
    expect(result).toContain('2026');
  });
});

describe('hasKeyBeenUsed', () => {
  it('returns true when lastUsedAt is set', () => {
    const key = makeKey({ lastUsedAt: '2026-03-01T00:00:00.000Z' });
    expect(hasKeyBeenUsed(key)).toBe(true);
  });

  it('returns false when lastUsedAt is null', () => {
    const key = makeKey({ lastUsedAt: null });
    expect(hasKeyBeenUsed(key)).toBe(false);
  });
});
