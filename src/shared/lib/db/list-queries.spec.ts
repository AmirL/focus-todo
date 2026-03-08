import { describe, it, expect, vi, beforeEach } from 'vitest';
import { and } from 'drizzle-orm';
import { CasingCache } from 'drizzle-orm/casing';
import {
  userListFilter,
  userListByNameFilter,
  userTasksByListFilter,
  userGoalsByListFilter,
  countListUsage,
  createDefaultLists,
  reassignItemsToList,
  setListArchivedStatus,
} from './list-queries';

// Mock the DB module
const mockWhere = vi.fn().mockReturnThis();
const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
const mockValues = vi.fn().mockResolvedValue(undefined);

vi.mock('@/shared/lib/db', () => ({
  DB: {
    select: vi.fn(() => ({ from: mockFrom })),
    insert: vi.fn(() => ({ values: mockValues })),
    update: vi.fn(() => ({ set: mockSet })),
    delete: vi.fn(() => ({ where: mockWhere })),
  },
}));

const casing = new CasingCache();

/**
 * Convert a drizzle SQL condition to a normalized SQL string for assertions.
 */
function toSQL(condition: ReturnType<typeof and>): string {
  if (!condition) return '';
  const query = condition.toQuery({
    casing,
    escapeName: (name: string) => `\`${name}\``,
    escapeParam: (_num: number, _val: unknown) => `?`,
    escapeString: (str: string) => `'${str}'`,
  });
  return query.sql;
}

function toParams(condition: ReturnType<typeof and>): unknown[] {
  if (!condition) return [];
  const query = condition.toQuery({
    casing,
    escapeName: (name: string) => `\`${name}\``,
    escapeParam: (_num: number, _val: unknown) => `?`,
    escapeString: (str: string) => `'${str}'`,
  });
  return query.params;
}

describe('list-queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('userListFilter', () => {
    it('should filter by userId only when no listId provided', () => {
      const condition = userListFilter('user-1');
      const sql = toSQL(condition);
      const params = toParams(condition);

      expect(sql).toContain('`user_id` = ?');
      expect(sql).not.toContain('`id`');
      expect(params).toContain('user-1');
    });

    it('should filter by userId and listId when both provided', () => {
      const condition = userListFilter('user-1', 5);
      const sql = toSQL(condition);
      const params = toParams(condition);

      expect(sql).toContain('`user_id` = ?');
      expect(sql).toContain('`id` = ?');
      expect(params).toContain('user-1');
      expect(params).toContain(5);
    });
  });

  describe('userListByNameFilter', () => {
    it('should filter by userId and list name', () => {
      const condition = userListByNameFilter('user-1', 'Work');
      const sql = toSQL(condition);
      const params = toParams(condition);

      expect(sql).toContain('`user_id` = ?');
      expect(sql).toContain('`name` = ?');
      expect(params).toContain('user-1');
      expect(params).toContain('Work');
    });
  });

  describe('userTasksByListFilter', () => {
    it('should filter tasks by userId and listId', () => {
      const condition = userTasksByListFilter('user-1', 3);
      const sql = toSQL(condition);
      const params = toParams(condition);

      expect(sql).toContain('`user_id` = ?');
      expect(sql).toContain('`list_id` = ?');
      expect(params).toContain('user-1');
      expect(params).toContain(3);
    });
  });

  describe('userGoalsByListFilter', () => {
    it('should filter goals by userId and listId', () => {
      const condition = userGoalsByListFilter('user-1', 7);
      const sql = toSQL(condition);
      const params = toParams(condition);

      expect(sql).toContain('`user_id` = ?');
      expect(sql).toContain('`list_id` = ?');
      expect(params).toContain('user-1');
      expect(params).toContain(7);
    });
  });

  describe('countListUsage', () => {
    it('should query both tasks and goals tables and return counts', async () => {
      mockWhere
        .mockResolvedValueOnce([{ count: 3 }])
        .mockResolvedValueOnce([{ count: 1 }]);

      const result = await countListUsage('user-1', 5);

      expect(result).toEqual({ tasksCount: 3, goalsCount: 1 });
    });

    it('should return zero counts when no results', async () => {
      mockWhere
        .mockResolvedValueOnce([{ count: 0 }])
        .mockResolvedValueOnce([{ count: 0 }]);

      const result = await countListUsage('user-1', 5);

      expect(result).toEqual({ tasksCount: 0, goalsCount: 0 });
    });

    it('should return zero when query returns undefined count', async () => {
      mockWhere
        .mockResolvedValueOnce([undefined])
        .mockResolvedValueOnce([undefined]);

      const result = await countListUsage('user-1', 5);

      expect(result).toEqual({ tasksCount: 0, goalsCount: 0 });
    });
  });

  describe('createDefaultLists', () => {
    it('should insert Work and Personal lists with correct sort order', async () => {
      const { DB } = await import('@/shared/lib/db');

      await createDefaultLists('user-42');

      expect(DB.insert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalledWith([
        { name: 'Work', userId: 'user-42', isDefault: true, sortOrder: 0 },
        { name: 'Personal', userId: 'user-42', isDefault: true, sortOrder: 1 },
      ]);
    });
  });

  describe('reassignItemsToList', () => {
    it('should update both tasks and goals to the new listId', async () => {
      const { DB } = await import('@/shared/lib/db');

      mockWhere.mockResolvedValue(undefined);

      await reassignItemsToList('user-1', 2, 5);

      // Should call update twice: once for tasks, once for goals
      expect(DB.update).toHaveBeenCalledTimes(2);
      // Both calls set the new listId
      expect(mockSet).toHaveBeenCalledWith({ listId: 5 });
    });
  });

  describe('setListArchivedStatus', () => {
    it('should set archivedAt to a Date when archiving', async () => {
      const { DB } = await import('@/shared/lib/db');

      mockWhere.mockResolvedValue(undefined);

      await setListArchivedStatus('user-1', 3, true);

      expect(DB.update).toHaveBeenCalled();
      const setCall = mockSet.mock.calls[0][0];
      expect(setCall.archivedAt).toBeInstanceOf(Date);
      expect(setCall.updatedAt).toBeInstanceOf(Date);
    });

    it('should set archivedAt to null when unarchiving', async () => {
      const { DB } = await import('@/shared/lib/db');

      mockWhere.mockResolvedValue(undefined);

      await setListArchivedStatus('user-1', 3, false);

      expect(DB.update).toHaveBeenCalled();
      const setCall = mockSet.mock.calls[0][0];
      expect(setCall.archivedAt).toBeNull();
      expect(setCall.updatedAt).toBeInstanceOf(Date);
    });
  });
});
