import { describe, it, expect } from 'vitest';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';
import { fuzzyScore, rankTasks, buildSpotlightDisplay } from './spotlight';

function makeTask(overrides: Partial<TaskModel> = {}): TaskModel {
  return createInstance(TaskModel, {
    id: 'task-1',
    name: 'Test Task',
    details: '',
    selectedAt: null,
    date: null,
    completedAt: null,
    listId: 1,
    deletedAt: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    estimatedDuration: null,
    isBlocker: false,
    sortOrder: 0,
    aiSuggestions: null,
    goalId: null,
    ...overrides,
  });
}

describe('fuzzyScore', () => {
  it('should return 0 for exact substring match', () => {
    expect(fuzzyScore('test', 'this is a test')).toBe(0);
  });

  it('should return 0 for exact full match', () => {
    expect(fuzzyScore('hello', 'hello')).toBe(0);
  });

  it('should return null when needle is empty', () => {
    expect(fuzzyScore('', 'some text')).toBeNull();
  });

  it('should return null when haystack is empty', () => {
    expect(fuzzyScore('test', '')).toBeNull();
  });

  it('should return null when both are empty', () => {
    expect(fuzzyScore('', '')).toBeNull();
  });

  it('should return null when characters are not found in order', () => {
    expect(fuzzyScore('xyz', 'abc')).toBeNull();
  });

  it('should be case-insensitive', () => {
    expect(fuzzyScore('TEST', 'this is a test')).toBe(0);
    expect(fuzzyScore('test', 'THIS IS A TEST')).toBe(0);
  });

  it('should return a positive score for fuzzy subsequence match', () => {
    const score = fuzzyScore('tsk', 'task');
    expect(score).not.toBeNull();
    expect(score!).toBeGreaterThan(0);
  });

  it('should return a lower score for tighter matches', () => {
    // "abc" in "abcdef" is a substring match (score 0)
    // "abc" in "a_b_c_d" is a spread-out match
    const tight = fuzzyScore('abc', 'abcdef');
    const loose = fuzzyScore('abc', 'a__b__c');
    expect(tight).toBe(0); // substring match
    expect(loose).not.toBeNull();
    expect(loose!).toBeGreaterThan(0);
  });

  it('should prioritize earlier matches', () => {
    // "ab" at position 0 vs "ab" at position 5
    const early = fuzzyScore('ab', 'ab___');
    const late = fuzzyScore('ab', '_____ab');
    expect(early).toBe(0); // exact substring at start
    expect(late).toBe(0); // also exact substring
  });

  it('should handle single character needle', () => {
    expect(fuzzyScore('a', 'apple')).toBe(0);
    expect(fuzzyScore('z', 'apple')).toBeNull();
  });

  it('should handle needle longer than haystack', () => {
    expect(fuzzyScore('abcdef', 'abc')).toBeNull();
  });
});

describe('rankTasks', () => {
  it('should return empty array for empty query', () => {
    const tasks = [makeTask({ name: 'Test Task' })];
    expect(rankTasks(tasks, '')).toEqual([]);
  });

  it('should return empty array for whitespace-only query', () => {
    const tasks = [makeTask({ name: 'Test Task' })];
    expect(rankTasks(tasks, '   ')).toEqual([]);
  });

  it('should return empty array for empty tasks', () => {
    expect(rankTasks([], 'test')).toEqual([]);
  });

  it('should match tasks by name', () => {
    const tasks = [
      makeTask({ id: 't1', name: 'Buy groceries' }),
      makeTask({ id: 't2', name: 'Write report' }),
      makeTask({ id: 't3', name: 'Buy new shoes' }),
    ];

    const result = rankTasks(tasks, 'buy');
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id).sort()).toEqual(['t1', 't3']);
  });

  it('should match tasks by details', () => {
    const tasks = [
      makeTask({ id: 't1', name: 'Task A', details: 'Need to review the budget' }),
      makeTask({ id: 't2', name: 'Task B', details: 'Send email to client' }),
    ];

    const result = rankTasks(tasks, 'budget');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('t1');
  });

  it('should exclude deleted tasks', () => {
    const tasks = [
      makeTask({ id: 't1', name: 'Buy groceries', deletedAt: new Date('2024-06-15') }),
      makeTask({ id: 't2', name: 'Buy new shoes' }),
    ];

    const result = rankTasks(tasks, 'buy');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('t2');
  });

  it('should rank active tasks before completed tasks', () => {
    const tasks = [
      makeTask({
        id: 't1',
        name: 'Buy groceries',
        completedAt: new Date('2024-06-15'),
        updatedAt: new Date('2024-06-15T10:00:00Z'),
      }),
      makeTask({
        id: 't2',
        name: 'Buy new shoes',
        completedAt: null,
        updatedAt: new Date('2024-06-10T10:00:00Z'),
      }),
    ];

    const result = rankTasks(tasks, 'buy');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('t2'); // active first
    expect(result[1].id).toBe('t1'); // completed second
  });

  it('should rank more recently updated tasks higher among same status', () => {
    const tasks = [
      makeTask({
        id: 't1',
        name: 'Buy apples',
        updatedAt: new Date('2024-06-10T10:00:00Z'),
      }),
      makeTask({
        id: 't2',
        name: 'Buy bananas',
        updatedAt: new Date('2024-06-15T10:00:00Z'),
      }),
    ];

    const result = rankTasks(tasks, 'buy');
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('t2'); // more recently updated
    expect(result[1].id).toBe('t1');
  });

  it('should return no results when no tasks match', () => {
    const tasks = [
      makeTask({ id: 't1', name: 'Buy groceries', details: '' }),
      makeTask({ id: 't2', name: 'Write report', details: '' }),
    ];

    const result = rankTasks(tasks, 'zzzzz');
    expect(result).toHaveLength(0);
  });
});

describe('buildSpotlightDisplay', () => {
  it('should return empty array for empty input', () => {
    expect(buildSpotlightDisplay([])).toEqual([]);
  });

  it('should show active tasks as individual items', () => {
    const tasks = [
      makeTask({ id: 't1', name: 'Active task', completedAt: null }),
    ];

    const display = buildSpotlightDisplay(tasks);
    expect(display).toHaveLength(1);
    expect(display[0].type).toBe('active');
    if (display[0].type === 'active') {
      expect(display[0].task.id).toBe('t1');
    }
  });

  it('should show completed tasks as grouped items', () => {
    const tasks = [
      makeTask({ id: 't1', name: 'Completed task', completedAt: new Date('2024-06-15') }),
    ];

    const display = buildSpotlightDisplay(tasks);
    expect(display).toHaveLength(1);
    expect(display[0].type).toBe('completedGroup');
    if (display[0].type === 'completedGroup') {
      expect(display[0].name).toBe('Completed task');
      expect(display[0].count).toBe(1);
    }
  });

  it('should group completed tasks with the same name', () => {
    const tasks = [
      makeTask({
        id: 't1',
        name: 'Recurring task',
        completedAt: new Date('2024-06-15'),
        updatedAt: new Date('2024-06-15T10:00:00Z'),
      }),
      makeTask({
        id: 't2',
        name: 'Recurring task',
        completedAt: new Date('2024-06-14'),
        updatedAt: new Date('2024-06-14T10:00:00Z'),
      }),
      makeTask({
        id: 't3',
        name: 'Recurring task',
        completedAt: new Date('2024-06-13'),
        updatedAt: new Date('2024-06-13T10:00:00Z'),
      }),
    ];

    const display = buildSpotlightDisplay(tasks);
    expect(display).toHaveLength(1);
    expect(display[0].type).toBe('completedGroup');
    if (display[0].type === 'completedGroup') {
      expect(display[0].count).toBe(3);
      expect(display[0].newestTask.id).toBe('t1');
    }
  });

  it('should not group completed tasks with different names', () => {
    const tasks = [
      makeTask({
        id: 't1',
        name: 'Task A',
        completedAt: new Date('2024-06-15'),
      }),
      makeTask({
        id: 't2',
        name: 'Task B',
        completedAt: new Date('2024-06-14'),
      }),
    ];

    const display = buildSpotlightDisplay(tasks);
    expect(display).toHaveLength(2);
    expect(display[0].type).toBe('completedGroup');
    expect(display[1].type).toBe('completedGroup');
    if (display[0].type === 'completedGroup' && display[1].type === 'completedGroup') {
      expect(display[0].name).toBe('Task A');
      expect(display[1].name).toBe('Task B');
    }
  });

  it('should mix active and completed items preserving order', () => {
    const tasks = [
      makeTask({ id: 't1', name: 'Active 1', completedAt: null }),
      makeTask({
        id: 't2',
        name: 'Done task',
        completedAt: new Date('2024-06-15'),
      }),
      makeTask({ id: 't3', name: 'Active 2', completedAt: null }),
    ];

    const display = buildSpotlightDisplay(tasks);
    expect(display).toHaveLength(3);
    expect(display[0].type).toBe('active');
    expect(display[1].type).toBe('completedGroup');
    expect(display[2].type).toBe('active');
  });

  it('should use "(untitled)" for completed tasks with empty names', () => {
    const tasks = [
      makeTask({
        id: 't1',
        name: '',
        completedAt: new Date('2024-06-15'),
      }),
    ];

    const display = buildSpotlightDisplay(tasks);
    expect(display).toHaveLength(1);
    if (display[0].type === 'completedGroup') {
      expect(display[0].name).toBe('(untitled)');
    }
  });

  it('should track the newest task in a completed group', () => {
    const tasks = [
      makeTask({
        id: 't1',
        name: 'Recurring',
        completedAt: new Date('2024-06-10'),
        updatedAt: new Date('2024-06-10T10:00:00Z'),
      }),
      makeTask({
        id: 't2',
        name: 'Recurring',
        completedAt: new Date('2024-06-15'),
        updatedAt: new Date('2024-06-15T10:00:00Z'),
      }),
    ];

    const display = buildSpotlightDisplay(tasks);
    expect(display).toHaveLength(1);
    if (display[0].type === 'completedGroup') {
      expect(display[0].newestTask.id).toBe('t2');
      expect(display[0].count).toBe(2);
    }
  });
});
