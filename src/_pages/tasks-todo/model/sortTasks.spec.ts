import { describe, it, expect } from 'vitest';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';
import {
  sortTasksByDateWithManualOrder,
  sortBlockerTasksBottomWithManualOrder,
  sortByManualOrder,
} from './sortTasks';

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

describe('sortByManualOrder', () => {
  it('should return empty array for empty input', () => {
    expect(sortByManualOrder([])).toEqual([]);
  });

  it('should sort tasks by sortOrder ascending', () => {
    const tasks = [
      makeTask({ id: 't3', sortOrder: 3 }),
      makeTask({ id: 't1', sortOrder: 1 }),
      makeTask({ id: 't2', sortOrder: 2 }),
    ];

    const result = sortByManualOrder(tasks);

    expect(result[0].id).toBe('t1');
    expect(result[1].id).toBe('t2');
    expect(result[2].id).toBe('t3');
  });

  it('should treat undefined/0 sortOrder as 0', () => {
    const tasks = [
      makeTask({ id: 't2', sortOrder: 5 }),
      makeTask({ id: 't1', sortOrder: 0 }),
    ];

    const result = sortByManualOrder(tasks);

    expect(result[0].id).toBe('t1');
    expect(result[1].id).toBe('t2');
  });

  it('should not mutate the original array', () => {
    const tasks = [
      makeTask({ id: 't2', sortOrder: 2 }),
      makeTask({ id: 't1', sortOrder: 1 }),
    ];
    const original = [...tasks];

    sortByManualOrder(tasks);

    expect(tasks[0].id).toBe(original[0].id);
    expect(tasks[1].id).toBe(original[1].id);
  });

  it('should handle negative sortOrder values', () => {
    const tasks = [
      makeTask({ id: 't2', sortOrder: 0 }),
      makeTask({ id: 't1', sortOrder: -1 }),
      makeTask({ id: 't3', sortOrder: 1 }),
    ];

    const result = sortByManualOrder(tasks);

    expect(result[0].id).toBe('t1');
    expect(result[1].id).toBe('t2');
    expect(result[2].id).toBe('t3');
  });
});

describe('sortTasksByDateWithManualOrder', () => {
  it('should return empty array for empty input', () => {
    expect(sortTasksByDateWithManualOrder([])).toEqual([]);
  });

  it('should sort tasks primarily by date ascending', () => {
    const tasks = [
      makeTask({ id: 't3', date: new Date('2024-06-20T00:00:00Z'), sortOrder: 1 }),
      makeTask({ id: 't1', date: new Date('2024-06-15T00:00:00Z'), sortOrder: 1 }),
      makeTask({ id: 't2', date: new Date('2024-06-18T00:00:00Z'), sortOrder: 1 }),
    ];

    const result = sortTasksByDateWithManualOrder(tasks);

    expect(result[0].id).toBe('t1'); // June 15
    expect(result[1].id).toBe('t2'); // June 18
    expect(result[2].id).toBe('t3'); // June 20
  });

  it('should use sortOrder as secondary sort when dates are the same', () => {
    const tasks = [
      makeTask({ id: 't3', date: new Date('2024-06-15T00:00:00Z'), sortOrder: 3 }),
      makeTask({ id: 't1', date: new Date('2024-06-15T00:00:00Z'), sortOrder: 1 }),
      makeTask({ id: 't2', date: new Date('2024-06-15T00:00:00Z'), sortOrder: 2 }),
    ];

    const result = sortTasksByDateWithManualOrder(tasks);

    expect(result[0].id).toBe('t1');
    expect(result[1].id).toBe('t2');
    expect(result[2].id).toBe('t3');
  });

  it('should treat null dates as unix time 0 (earliest)', () => {
    const tasks = [
      makeTask({ id: 't2', date: new Date('2024-06-15T00:00:00Z'), sortOrder: 1 }),
      makeTask({ id: 't1', date: null, sortOrder: 1 }),
    ];

    const result = sortTasksByDateWithManualOrder(tasks);

    expect(result[0].id).toBe('t1'); // null date -> unix 0 -> earliest
    expect(result[1].id).toBe('t2');
  });

  it('should not mutate the original array', () => {
    const tasks = [
      makeTask({ id: 't2', date: new Date('2024-06-20'), sortOrder: 1 }),
      makeTask({ id: 't1', date: new Date('2024-06-15'), sortOrder: 1 }),
    ];
    const original = [...tasks];

    sortTasksByDateWithManualOrder(tasks);

    expect(tasks[0].id).toBe(original[0].id);
    expect(tasks[1].id).toBe(original[1].id);
  });

  it('should handle mixed dates and sort orders correctly', () => {
    const tasks = [
      makeTask({ id: 't4', date: new Date('2024-06-18T00:00:00Z'), sortOrder: 1 }),
      makeTask({ id: 't3', date: new Date('2024-06-15T00:00:00Z'), sortOrder: 2 }),
      makeTask({ id: 't2', date: new Date('2024-06-18T00:00:00Z'), sortOrder: 0 }),
      makeTask({ id: 't1', date: new Date('2024-06-15T00:00:00Z'), sortOrder: 1 }),
    ];

    const result = sortTasksByDateWithManualOrder(tasks);

    expect(result[0].id).toBe('t1'); // June 15, order 1
    expect(result[1].id).toBe('t3'); // June 15, order 2
    expect(result[2].id).toBe('t2'); // June 18, order 0
    expect(result[3].id).toBe('t4'); // June 18, order 1
  });
});

describe('sortBlockerTasksBottomWithManualOrder', () => {
  it('should return empty array for empty input', () => {
    expect(sortBlockerTasksBottomWithManualOrder([])).toEqual([]);
  });

  it('should place non-blocker tasks before blocker tasks', () => {
    const tasks = [
      makeTask({ id: 't1', isBlocker: true, sortOrder: 1 }),
      makeTask({ id: 't2', isBlocker: false, sortOrder: 1 }),
    ];

    const result = sortBlockerTasksBottomWithManualOrder(tasks);

    expect(result[0].id).toBe('t2'); // non-blocker first
    expect(result[1].id).toBe('t1'); // blocker last
  });

  it('should use sortOrder as secondary sort within same blocker status', () => {
    const tasks = [
      makeTask({ id: 't3', isBlocker: false, sortOrder: 3 }),
      makeTask({ id: 't1', isBlocker: false, sortOrder: 1 }),
      makeTask({ id: 't2', isBlocker: false, sortOrder: 2 }),
    ];

    const result = sortBlockerTasksBottomWithManualOrder(tasks);

    expect(result[0].id).toBe('t1');
    expect(result[1].id).toBe('t2');
    expect(result[2].id).toBe('t3');
  });

  it('should sort blockers by sortOrder among themselves', () => {
    const tasks = [
      makeTask({ id: 'b2', isBlocker: true, sortOrder: 2 }),
      makeTask({ id: 'b1', isBlocker: true, sortOrder: 1 }),
      makeTask({ id: 'n1', isBlocker: false, sortOrder: 1 }),
    ];

    const result = sortBlockerTasksBottomWithManualOrder(tasks);

    expect(result[0].id).toBe('n1');  // non-blocker
    expect(result[1].id).toBe('b1');  // blocker, order 1
    expect(result[2].id).toBe('b2');  // blocker, order 2
  });

  it('should not mutate the original array', () => {
    const tasks = [
      makeTask({ id: 't1', isBlocker: true, sortOrder: 1 }),
      makeTask({ id: 't2', isBlocker: false, sortOrder: 1 }),
    ];
    const original = [...tasks];

    sortBlockerTasksBottomWithManualOrder(tasks);

    expect(tasks[0].id).toBe(original[0].id);
    expect(tasks[1].id).toBe(original[1].id);
  });

  it('should handle all non-blockers correctly', () => {
    const tasks = [
      makeTask({ id: 't3', isBlocker: false, sortOrder: 3 }),
      makeTask({ id: 't1', isBlocker: false, sortOrder: 1 }),
      makeTask({ id: 't2', isBlocker: false, sortOrder: 2 }),
    ];

    const result = sortBlockerTasksBottomWithManualOrder(tasks);

    expect(result[0].id).toBe('t1');
    expect(result[1].id).toBe('t2');
    expect(result[2].id).toBe('t3');
  });

  it('should handle all blockers correctly', () => {
    const tasks = [
      makeTask({ id: 't3', isBlocker: true, sortOrder: 3 }),
      makeTask({ id: 't1', isBlocker: true, sortOrder: 1 }),
      makeTask({ id: 't2', isBlocker: true, sortOrder: 2 }),
    ];

    const result = sortBlockerTasksBottomWithManualOrder(tasks);

    expect(result[0].id).toBe('t1');
    expect(result[1].id).toBe('t2');
    expect(result[2].id).toBe('t3');
  });
});
