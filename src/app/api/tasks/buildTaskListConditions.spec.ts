import { describe, it, expect } from 'vitest';
import { and, SQL } from 'drizzle-orm';
import { CasingCache } from 'drizzle-orm/casing';
import { buildTaskListConditions } from './buildTaskListConditions';

const casing = new CasingCache();

/**
 * Helper to convert drizzle SQL conditions into a normalized SQL-like string
 * for comparison, since drizzle SQL objects don't support direct deep equality.
 */
function conditionsToSQL(conditions: (SQL | undefined)[]): string {
  const clause = and(...conditions);
  if (!clause) return '';
  const query = clause.toQuery({
    casing,
    escapeName: (name: string) => `\`${name}\``,
    escapeParam: (_num: number, _val: unknown) => `?`,
    escapeString: (str: string) => `'${str}'`,
  });
  return query.sql;
}

function conditionsParams(conditions: (SQL | undefined)[]): unknown[] {
  const clause = and(...conditions);
  if (!clause) return [];
  const query = clause.toQuery({
    casing,
    escapeName: (name: string) => `\`${name}\``,
    escapeParam: (_num: number, _val: unknown) => `?`,
    escapeString: (str: string) => `'${str}'`,
  });
  return query.params;
}

describe('buildTaskListConditions', () => {
  describe('completed + listId combination (bug fix)', () => {
    it('should include BOTH completedAt filter and listId conditions when completed=false and listId are set', () => {
      const conditions = buildTaskListConditions({
        userId: 'test-user',
        completed: 'false',
        listId: '2',
      });

      const sql = conditionsToSQL(conditions);
      const params = conditionsParams(conditions);

      // Must include both conditions - this is the reported bug scenario
      // completed=false must match NULL and MySQL zero dates
      expect(sql).toContain('`completed_at` is null');
      expect(sql).toContain('`list_id` = ?');
      expect(params).toContain(2);
    });

    it('should return matching tasks when both completed=false and listId are used', () => {
      const conditions = buildTaskListConditions({
        userId: 'test-user',
        completed: 'false',
        listId: '2',
      });

      const sql = conditionsToSQL(conditions);

      // Core conditions should ALL be present (AND-ed together)
      expect(sql).toContain('`user_id` = ?');
      expect(sql).toContain('`deleted_at` is null');
      expect(sql).toContain('`list_id` = ?');
      // completed=false uses OR(IS NULL, < epoch) to handle zero dates
      expect(sql).toContain('`completed_at` is null');
      expect(sql).toContain('`completed_at` <');
    });
  });

  describe('basic userId filtering', () => {
    it('should always include userId condition', () => {
      const conditions = buildTaskListConditions({ userId: 'test-user' });
      const sql = conditionsToSQL(conditions);
      expect(sql).toContain('`user_id` = ?');
      expect(conditionsParams(conditions)).toContain('test-user');
    });
  });

  describe('deleted filtering', () => {
    it('should filter out deleted tasks by default', () => {
      const conditions = buildTaskListConditions({ userId: 'test-user' });
      const sql = conditionsToSQL(conditions);
      expect(sql).toContain('`deleted_at` is null');
    });

    it('should not filter deleted when includeDeleted=true', () => {
      const conditions = buildTaskListConditions({
        userId: 'test-user',
        includeDeleted: true,
      });
      const sql = conditionsToSQL(conditions);
      expect(sql).not.toContain('deleted_at');
    });
  });

  describe('completed filtering', () => {
    it('should handle completed=false by matching NULL or MySQL zero dates', () => {
      // Bug fix: MySQL zero dates (0000-00-00 00:00:00) are NOT NULL in MySQL
      // but get converted to null by mysql2 driver. The completed=false filter
      // must catch both NULL and zero-date values.
      const conditions = buildTaskListConditions({
        userId: 'test-user',
        completed: 'false',
      });
      const sql = conditionsToSQL(conditions);
      // Should use OR to match both NULL and zero/invalid dates
      expect(sql).toContain('`completed_at` is null');
      expect(sql).toContain('`completed_at` <');
    });

    it('should handle completed=true by matching only valid completedAt dates', () => {
      // completed=true should only match tasks with a real completion timestamp,
      // not zero dates that MySQL treats as NOT NULL
      const conditions = buildTaskListConditions({
        userId: 'test-user',
        completed: 'true',
      });
      const sql = conditionsToSQL(conditions);
      expect(sql).toContain('`completed_at` >');
    });

    it('should not add completedAt condition when completed is not provided', () => {
      const conditions = buildTaskListConditions({
        userId: 'test-user',
      });
      const sql = conditionsToSQL(conditions);
      expect(sql).not.toContain('completed_at');
    });
  });

  describe('listId filtering', () => {
    it('should add listId condition when provided', () => {
      const conditions = buildTaskListConditions({
        userId: 'test-user',
        listId: '2',
      });
      const sql = conditionsToSQL(conditions);
      expect(sql).toContain('`list_id` = ?');
      expect(conditionsParams(conditions)).toContain(2);
    });

    it('should not add listId condition when not provided', () => {
      const conditions = buildTaskListConditions({
        userId: 'test-user',
      });
      const sql = conditionsToSQL(conditions);
      expect(sql).not.toContain('list_id');
    });

    it('should not add listId condition for NaN value', () => {
      const conditions = buildTaskListConditions({
        userId: 'test-user',
        listId: 'invalid',
      });
      const sql = conditionsToSQL(conditions);
      expect(sql).not.toContain('list_id');
    });
  });

  describe('goalId filtering', () => {
    it('should add goalId condition when provided', () => {
      const conditions = buildTaskListConditions({
        userId: 'test-user',
        goalId: '5',
      });
      const sql = conditionsToSQL(conditions);
      expect(sql).toContain('`goal_id` = ?');
      expect(conditionsParams(conditions)).toContain(5);
    });
  });

  describe('date filtering with since/until', () => {
    it('should add since condition with gt when provided', () => {
      const conditions = buildTaskListConditions({
        userId: 'test-user',
        since: '2026-01-01T00:00:00Z',
      });
      const sql = conditionsToSQL(conditions);
      expect(sql).toContain('`date` > ?');
    });

    it('should add until condition with lt when provided', () => {
      const conditions = buildTaskListConditions({
        userId: 'test-user',
        until: '2026-02-01T00:00:00Z',
      });
      const sql = conditionsToSQL(conditions);
      expect(sql).toContain('`date` < ?');
    });
  });
});
