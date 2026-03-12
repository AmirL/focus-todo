import { describe, it, expect } from 'vitest';
import { serializeList } from './serialize';

describe('serializeList', () => {
  it('should serialize a list row with date fields as ISO strings', () => {
    const row = {
      id: 1,
      name: 'Work',
      description: 'Work tasks',
      color: null,
      userId: 'user-1',
      isDefault: true,
      participatesInInitiative: true,
      sortOrder: 0,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-15T10:00:00Z'),
      archivedAt: null,
    };

    const result = serializeList(row);

    expect(result).toEqual({
      id: 1,
      name: 'Work',
      description: 'Work tasks',
      color: null,
      userId: 'user-1',
      isDefault: true,
      participatesInInitiative: true,
      sortOrder: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-15T10:00:00.000Z',
      archivedAt: null,
    });
  });

  it('should serialize archivedAt when present', () => {
    const row = {
      id: 2,
      name: 'Archived List',
      description: null,
      color: null,
      userId: 'user-1',
      isDefault: false,
      participatesInInitiative: false,
      sortOrder: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-02-01T00:00:00Z'),
      archivedAt: new Date('2026-02-01T00:00:00Z'),
    };

    const result = serializeList(row);
    expect(result.archivedAt).toBe('2026-02-01T00:00:00.000Z');
  });

  it('should handle null description', () => {
    const row = {
      id: 3,
      name: 'Personal',
      description: null,
      color: null,
      userId: 'user-1',
      isDefault: true,
      participatesInInitiative: true,
      sortOrder: 1,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: null,
      archivedAt: null,
    };

    const result = serializeList(row);
    expect(result.description).toBeNull();
    expect(result.updatedAt).toBeNull();
  });
});
