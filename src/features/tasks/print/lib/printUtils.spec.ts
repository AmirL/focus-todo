import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';
import {
  filterPrintableTasks,
  groupTasksByList,
  sortTasksByDuration,
  formatPrintDate,
  formatDuration,
  calculateTotalDuration,
} from './printUtils';

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

describe('filterPrintableTasks', () => {
  it('should return an empty array for empty input', () => {
    expect(filterPrintableTasks([])).toEqual([]);
  });

  it('should include active tasks (not completed, not deleted)', () => {
    const tasks = [
      makeTask({ id: 't1', completedAt: null, deletedAt: null }),
      makeTask({ id: 't2', completedAt: null, deletedAt: null }),
    ];
    expect(filterPrintableTasks(tasks)).toHaveLength(2);
  });

  it('should exclude completed tasks', () => {
    const tasks = [
      makeTask({ id: 't1', completedAt: null }),
      makeTask({ id: 't2', completedAt: new Date('2024-06-15') }),
    ];
    const result = filterPrintableTasks(tasks);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('t1');
  });

  it('should exclude deleted tasks', () => {
    const tasks = [
      makeTask({ id: 't1', deletedAt: null }),
      makeTask({ id: 't2', deletedAt: new Date('2024-06-15') }),
    ];
    const result = filterPrintableTasks(tasks);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('t1');
  });

  it('should exclude tasks that are both completed and deleted', () => {
    const tasks = [
      makeTask({
        id: 't1',
        completedAt: new Date('2024-06-15'),
        deletedAt: new Date('2024-06-15'),
      }),
    ];
    expect(filterPrintableTasks(tasks)).toHaveLength(0);
  });

  it('should handle a mixed array correctly', () => {
    const tasks = [
      makeTask({ id: 't1' }),                                                  // active
      makeTask({ id: 't2', completedAt: new Date('2024-06-15') }),             // completed
      makeTask({ id: 't3', deletedAt: new Date('2024-06-15') }),               // deleted
      makeTask({ id: 't4' }),                                                  // active
      makeTask({ id: 't5', completedAt: new Date('2024-06-15'), deletedAt: new Date('2024-06-15') }), // both
    ];
    const result = filterPrintableTasks(tasks);
    expect(result).toHaveLength(2);
    expect(result.map((t) => t.id)).toEqual(['t1', 't4']);
  });
});

describe('groupTasksByList', () => {
  it('should return empty object for empty tasks', () => {
    const listNameMap = new Map<number, string>();
    expect(groupTasksByList([], listNameMap)).toEqual({});
  });

  it('should group tasks by their list name', () => {
    const listNameMap = new Map<number, string>([
      [1, 'Work'],
      [2, 'Personal'],
    ]);
    const tasks = [
      makeTask({ id: 't1', listId: 1 }),
      makeTask({ id: 't2', listId: 2 }),
      makeTask({ id: 't3', listId: 1 }),
    ];

    const result = groupTasksByList(tasks, listNameMap);

    expect(Object.keys(result)).toEqual(['Work', 'Personal']);
    expect(result['Work']).toHaveLength(2);
    expect(result['Personal']).toHaveLength(1);
    expect(result['Work'][0].id).toBe('t1');
    expect(result['Work'][1].id).toBe('t3');
    expect(result['Personal'][0].id).toBe('t2');
  });

  it('should use "Unknown" for tasks with unmapped listId', () => {
    const listNameMap = new Map<number, string>([[1, 'Work']]);
    const tasks = [
      makeTask({ id: 't1', listId: 1 }),
      makeTask({ id: 't2', listId: 99 }),
    ];

    const result = groupTasksByList(tasks, listNameMap);

    expect(result['Work']).toHaveLength(1);
    expect(result['Unknown']).toHaveLength(1);
    expect(result['Unknown'][0].id).toBe('t2');
  });

  it('should handle all tasks in the same list', () => {
    const listNameMap = new Map<number, string>([[1, 'Work']]);
    const tasks = [
      makeTask({ id: 't1', listId: 1 }),
      makeTask({ id: 't2', listId: 1 }),
    ];

    const result = groupTasksByList(tasks, listNameMap);

    expect(Object.keys(result)).toEqual(['Work']);
    expect(result['Work']).toHaveLength(2);
  });
});

describe('sortTasksByDuration', () => {
  it('should sort tasks within each group by estimated duration descending', () => {
    const grouped = {
      Work: [
        makeTask({ id: 't1', estimatedDuration: 15 }),
        makeTask({ id: 't2', estimatedDuration: 60 }),
        makeTask({ id: 't3', estimatedDuration: 30 }),
      ],
    };

    sortTasksByDuration(grouped);

    expect(grouped.Work[0].id).toBe('t2'); // 60 min
    expect(grouped.Work[1].id).toBe('t3'); // 30 min
    expect(grouped.Work[2].id).toBe('t1'); // 15 min
  });

  it('should treat null durations as 0', () => {
    const grouped = {
      Work: [
        makeTask({ id: 't1', estimatedDuration: null }),
        makeTask({ id: 't2', estimatedDuration: 30 }),
      ],
    };

    sortTasksByDuration(grouped);

    expect(grouped.Work[0].id).toBe('t2'); // 30 min
    expect(grouped.Work[1].id).toBe('t1'); // 0 (null)
  });

  it('should sort tasks in multiple groups independently', () => {
    const grouped = {
      Work: [
        makeTask({ id: 't1', estimatedDuration: 10 }),
        makeTask({ id: 't2', estimatedDuration: 20 }),
      ],
      Personal: [
        makeTask({ id: 't3', estimatedDuration: 60 }),
        makeTask({ id: 't4', estimatedDuration: 5 }),
      ],
    };

    sortTasksByDuration(grouped);

    expect(grouped.Work[0].id).toBe('t2');
    expect(grouped.Work[1].id).toBe('t1');
    expect(grouped.Personal[0].id).toBe('t3');
    expect(grouped.Personal[1].id).toBe('t4');
  });

  it('should handle empty groups', () => {
    const grouped = { Work: [] as TaskModel[] };
    sortTasksByDuration(grouped);
    expect(grouped.Work).toHaveLength(0);
  });
});

describe('formatPrintDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should format a valid date', () => {
    const date = new Date('2024-03-25T00:00:00Z');
    expect(formatPrintDate(date)).toBe('25/03/2024');
  });

  it('should return today date when date is null', () => {
    expect(formatPrintDate(null)).toBe('15/06/2024');
  });
});

describe('formatDuration', () => {
  it('should return "0m" for null', () => {
    expect(formatDuration(null)).toBe('0m');
  });

  it('should return "0m" for 0', () => {
    expect(formatDuration(0)).toBe('0m');
  });

  it('should format minutes under 60', () => {
    expect(formatDuration(30)).toBe('30m');
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(1)).toBe('1m');
    expect(formatDuration(59)).toBe('59m');
  });

  it('should format exactly 60 minutes as hours', () => {
    expect(formatDuration(60)).toBe('1h');
  });

  it('should format multiples of 60 as hours', () => {
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(180)).toBe('3h');
  });

  it('should format fractional hours', () => {
    expect(formatDuration(90)).toBe('1.5h');
  });
});

describe('calculateTotalDuration', () => {
  it('should return 0 for empty array', () => {
    expect(calculateTotalDuration([])).toBe(0);
  });

  it('should sum all estimated durations', () => {
    const tasks = [
      makeTask({ estimatedDuration: 30 }),
      makeTask({ estimatedDuration: 45 }),
      makeTask({ estimatedDuration: 15 }),
    ];
    expect(calculateTotalDuration(tasks)).toBe(90);
  });

  it('should treat null durations as 0', () => {
    const tasks = [
      makeTask({ estimatedDuration: 30 }),
      makeTask({ estimatedDuration: null }),
      makeTask({ estimatedDuration: 60 }),
    ];
    expect(calculateTotalDuration(tasks)).toBe(90);
  });

  it('should include completed and deleted tasks (unlike calculateTotalEstimatedTime)', () => {
    const tasks = [
      makeTask({ estimatedDuration: 30, completedAt: new Date('2024-06-15') }),
      makeTask({ estimatedDuration: 45, deletedAt: new Date('2024-06-15') }),
      makeTask({ estimatedDuration: 15 }),
    ];
    // This function sums all durations regardless of status
    expect(calculateTotalDuration(tasks)).toBe(90);
  });

  it('should return 0 when all tasks have null durations', () => {
    const tasks = [
      makeTask({ estimatedDuration: null }),
      makeTask({ estimatedDuration: null }),
    ];
    expect(calculateTotalDuration(tasks)).toBe(0);
  });
});
