import { describe, it, expect } from 'vitest';
import { TaskModel } from '@/entities/task/model/task';
import { ListModel } from '@/entities/list';
import { createInstance } from '@/shared/lib/instance-tools';
import { groupTasksByList } from './groupTasks';

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

function makeList(overrides: Partial<ListModel> = {}): ListModel {
  return createInstance(ListModel, {
    id: '1',
    name: 'Work',
    description: null,
    userId: 'user-1',
    isDefault: false,
    participatesInInitiative: true,
    sortOrder: 0,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: null,
    archivedAt: null,
    ...overrides,
  });
}

function buildNameMap(lists: ListModel[]): Map<number, string> {
  return new Map(lists.map((l) => [Number(l.id), l.name]));
}

describe('groupTasksByList', () => {
  it('should return empty array for empty tasks', () => {
    const lists = [makeList({ id: '1', name: 'Work' })];
    const nameMap = buildNameMap(lists);

    expect(groupTasksByList([], lists, nameMap)).toEqual([]);
  });

  it('should group tasks by listId', () => {
    const lists = [
      makeList({ id: '1', name: 'Work', sortOrder: 0 }),
      makeList({ id: '2', name: 'Personal', sortOrder: 1 }),
    ];
    const nameMap = buildNameMap(lists);
    const tasks = [
      makeTask({ id: 't1', listId: 1 }),
      makeTask({ id: 't2', listId: 2 }),
      makeTask({ id: 't3', listId: 1 }),
    ];

    const result = groupTasksByList(tasks, lists, nameMap);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe('Work');
    expect(result[0].tasks).toHaveLength(2);
    expect(result[0].tasks[0].id).toBe('t1');
    expect(result[0].tasks[1].id).toBe('t3');
    expect(result[1].id).toBe(2);
    expect(result[1].name).toBe('Personal');
    expect(result[1].tasks).toHaveLength(1);
    expect(result[1].tasks[0].id).toBe('t2');
  });

  it('should sort groups by sidebar list order', () => {
    const lists = [
      makeList({ id: '3', name: 'Side Project', sortOrder: 0 }),
      makeList({ id: '1', name: 'Work', sortOrder: 1 }),
      makeList({ id: '2', name: 'Personal', sortOrder: 2 }),
    ];
    const nameMap = buildNameMap(lists);
    const tasks = [
      makeTask({ id: 't1', listId: 1 }),
      makeTask({ id: 't2', listId: 2 }),
      makeTask({ id: 't3', listId: 3 }),
    ];

    const result = groupTasksByList(tasks, lists, nameMap);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe(3);
    expect(result[0].name).toBe('Side Project');
    expect(result[1].id).toBe(1);
    expect(result[1].name).toBe('Work');
    expect(result[2].id).toBe(2);
    expect(result[2].name).toBe('Personal');
  });

  it('should prioritize focus list to appear first', () => {
    const lists = [
      makeList({ id: '1', name: 'Work', sortOrder: 0 }),
      makeList({ id: '2', name: 'Personal', sortOrder: 1 }),
      makeList({ id: '3', name: 'Side Project', sortOrder: 2 }),
    ];
    const nameMap = buildNameMap(lists);
    const tasks = [
      makeTask({ id: 't1', listId: 1 }),
      makeTask({ id: 't2', listId: 2 }),
      makeTask({ id: 't3', listId: 3 }),
    ];

    const result = groupTasksByList(tasks, lists, nameMap, {
      focusListName: 'Personal',
    });

    expect(result[0].id).toBe(2);
    expect(result[0].name).toBe('Personal');
    expect(result[1].id).toBe(1);
    expect(result[1].name).toBe('Work');
    expect(result[2].id).toBe(3);
    expect(result[2].name).toBe('Side Project');
  });

  it('should handle focus list that has no tasks (no effect)', () => {
    const lists = [
      makeList({ id: '1', name: 'Work', sortOrder: 0 }),
      makeList({ id: '2', name: 'Personal', sortOrder: 1 }),
    ];
    const nameMap = buildNameMap(lists);
    const tasks = [
      makeTask({ id: 't1', listId: 1 }),
    ];

    const result = groupTasksByList(tasks, lists, nameMap, {
      focusListName: 'Personal',
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe('Work');
  });

  it('should handle null focusListName same as no focus', () => {
    const lists = [
      makeList({ id: '1', name: 'Work', sortOrder: 0 }),
      makeList({ id: '2', name: 'Personal', sortOrder: 1 }),
    ];
    const nameMap = buildNameMap(lists);
    const tasks = [
      makeTask({ id: 't1', listId: 2 }),
      makeTask({ id: 't2', listId: 1 }),
    ];

    const result = groupTasksByList(tasks, lists, nameMap, {
      focusListName: null,
    });

    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe('Work');
    expect(result[1].id).toBe(2);
    expect(result[1].name).toBe('Personal');
  });

  it('should fall back to alphabetical order for unknown lists', () => {
    const lists: ListModel[] = [];
    const nameMap = new Map<number, string>([
      [2, 'Zebra'],
      [1, 'Alpha'],
    ]);
    const tasks = [
      makeTask({ id: 't1', listId: 2 }),
      makeTask({ id: 't2', listId: 1 }),
    ];

    const result = groupTasksByList(tasks, lists, nameMap);

    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe('Alpha');
    expect(result[1].id).toBe(2);
    expect(result[1].name).toBe('Zebra');
  });

  it('should show "Unknown" for lists not in the name map', () => {
    const lists: ListModel[] = [];
    const nameMap = new Map<number, string>();
    const tasks = [makeTask({ id: 't1', listId: 99 })];

    const result = groupTasksByList(tasks, lists, nameMap);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(99);
    expect(result[0].name).toBe('Unknown');
  });

  it('should place known-order lists before unknown lists', () => {
    const lists = [
      makeList({ id: '1', name: 'Work', sortOrder: 0 }),
    ];
    const nameMap = new Map<number, string>([
      [1, 'Work'],
      [5, 'Mystery'],
    ]);
    const tasks = [
      makeTask({ id: 't1', listId: 5 }),
      makeTask({ id: 't2', listId: 1 }),
    ];

    const result = groupTasksByList(tasks, lists, nameMap);

    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe('Work');
    expect(result[1].id).toBe(5);
    expect(result[1].name).toBe('Mystery');
  });

  it('should preserve task insertion order within each group', () => {
    const lists = [makeList({ id: '1', name: 'Work', sortOrder: 0 })];
    const nameMap = buildNameMap(lists);
    const tasks = [
      makeTask({ id: 'first', listId: 1 }),
      makeTask({ id: 'second', listId: 1 }),
      makeTask({ id: 'third', listId: 1 }),
    ];

    const result = groupTasksByList(tasks, lists, nameMap);

    expect(result[0].tasks.map((t) => t.id)).toEqual([
      'first',
      'second',
      'third',
    ]);
  });

  it('should handle single task in single list', () => {
    const lists = [makeList({ id: '1', name: 'Work', sortOrder: 0 })];
    const nameMap = buildNameMap(lists);
    const tasks = [makeTask({ id: 't1', listId: 1 })];

    const result = groupTasksByList(tasks, lists, nameMap);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(result[0].tasks).toHaveLength(1);
  });

  it('should focus list take priority over sidebar order', () => {
    const lists = [
      makeList({ id: '1', name: 'Work', sortOrder: 0 }),
      makeList({ id: '2', name: 'Personal', sortOrder: 1 }),
      makeList({ id: '3', name: 'Side Project', sortOrder: 2 }),
    ];
    const nameMap = buildNameMap(lists);
    const tasks = [
      makeTask({ id: 't1', listId: 1 }),
      makeTask({ id: 't2', listId: 2 }),
      makeTask({ id: 't3', listId: 3 }),
    ];

    const result = groupTasksByList(tasks, lists, nameMap, {
      focusListName: 'Side Project',
    });

    // Side Project should be first despite being sortOrder 2
    expect(result[0].name).toBe('Side Project');
    // Remaining lists keep their sidebar order
    expect(result[1].name).toBe('Work');
    expect(result[2].name).toBe('Personal');
  });

  it('should handle multiple tasks across many lists', () => {
    const lists = [
      makeList({ id: '1', name: 'A', sortOrder: 0 }),
      makeList({ id: '2', name: 'B', sortOrder: 1 }),
      makeList({ id: '3', name: 'C', sortOrder: 2 }),
      makeList({ id: '4', name: 'D', sortOrder: 3 }),
    ];
    const nameMap = buildNameMap(lists);
    const tasks = [
      makeTask({ id: 't1', listId: 4 }),
      makeTask({ id: 't2', listId: 2 }),
      makeTask({ id: 't3', listId: 4 }),
      makeTask({ id: 't4', listId: 1 }),
    ];

    const result = groupTasksByList(tasks, lists, nameMap);

    // Only lists with tasks should appear, in sidebar order
    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('A');
    expect(result[0].tasks).toHaveLength(1);
    expect(result[1].name).toBe('B');
    expect(result[1].tasks).toHaveLength(1);
    expect(result[2].name).toBe('D');
    expect(result[2].tasks).toHaveLength(2);
  });
});
