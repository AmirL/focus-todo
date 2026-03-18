import { describe, it, expect } from 'vitest';
import { serializeGoal, serializeGoalWithList } from './serialize';

describe('serializeGoal', () => {
  it('should serialize a goal row removing __list_deprecated', () => {
    const row = {
      id: 1,
      title: 'Test Goal',
      description: 'Some description',
      progress: 50,
      listId: 2,
      userId: 'user-1',
      deletedAt: new Date('2026-01-15T10:00:00Z'),
      createdAt: new Date('2026-01-01T00:00:00Z'),
      __list_deprecated: 'old',
    };

    const result = serializeGoal(row);

    expect(result).toEqual({
      id: 1,
      title: 'Test Goal',
      description: 'Some description',
      progress: 50,
      listId: 2,
      userId: 'user-1',
      deletedAt: '2026-01-15T10:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    expect(result).not.toHaveProperty('__list_deprecated');
  });

  it('should serialize null deletedAt as null', () => {
    const row = {
      id: 2,
      title: 'Active Goal',
      description: null,
      progress: 0,
      listId: 1,
      userId: 'user-1',
      deletedAt: null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      __list_deprecated: '',
    };

    const result = serializeGoal(row);
    expect(result.deletedAt).toBeNull();
  });

  it('should handle string dates by parsing them', () => {
    const row = {
      id: 3,
      title: 'Goal',
      description: null,
      progress: 25,
      listId: 1,
      userId: 'user-1',
      deletedAt: '2026-02-01T00:00:00Z' as unknown as Date,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      __list_deprecated: null,
    };

    const result = serializeGoal(row);
    expect(result.deletedAt).toBe('2026-02-01T00:00:00.000Z');
  });
});

describe('serializeGoalWithList', () => {
  it('should include listName in the serialized goal', () => {
    const row = {
      id: 1,
      title: 'Test Goal',
      description: 'desc',
      progress: 75,
      listId: 2,
      userId: 'user-1',
      deletedAt: null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      __list_deprecated: '',
    };

    const result = serializeGoalWithList(row, 'Work');

    expect(result.listName).toBe('Work');
    expect(result.id).toBe(1);
    expect(result).not.toHaveProperty('__list_deprecated');
  });

  it('should handle null listName', () => {
    const row = {
      id: 1,
      title: 'Test',
      description: null,
      progress: 0,
      listId: 1,
      userId: 'user-1',
      deletedAt: null,
      createdAt: new Date('2026-01-01T00:00:00Z'),
      __list_deprecated: '',
    };

    const result = serializeGoalWithList(row, null);
    expect(result.listName).toBeNull();
  });
});
