import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import { mapTimeEntriesToBlocks } from './mapTimeEntriesToBlocks';
import type { TimeEntry } from '@/shared/api/time-entries';
import type { TaskModel } from '@/entities/task/model/task';

function makeTask(overrides: Partial<TaskModel> & { id: string; listId: number }): TaskModel {
  return {
    name: 'Test Task',
    details: '',
    isBlocker: false,
    estimatedDuration: null,
    sortOrder: 0,
    aiSuggestions: null,
    goalId: null,
    updatedAt: new Date(),
    createdAt: new Date(),
    ...overrides,
  } as TaskModel;
}

function makeEntry(overrides: Partial<TimeEntry> & { id: number; taskId: number }): TimeEntry {
  return {
    userId: 'user-1',
    startedAt: dayjs().hour(9).minute(0).toISOString(),
    endedAt: dayjs().hour(10).minute(0).toISOString(),
    durationMinutes: 60,
    createdAt: dayjs().toISOString(),
    ...overrides,
  };
}

describe('mapTimeEntriesToBlocks', () => {
  const listNameMap = new Map([
    [1, 'Work'],
    [2, 'Personal'],
  ]);

  it('maps today entries to timeline blocks with task names and list names', () => {
    const tasks = [
      makeTask({ id: '10', name: 'Write tests', listId: 1 }),
      makeTask({ id: '20', name: 'Review PR', listId: 2 }),
    ];
    const entries = [
      makeEntry({ id: 1, taskId: 10, startedAt: dayjs().hour(9).toISOString(), endedAt: dayjs().hour(10).toISOString(), durationMinutes: 60 }),
      makeEntry({ id: 2, taskId: 20, startedAt: dayjs().hour(10).toISOString(), endedAt: dayjs().hour(11).toISOString(), durationMinutes: 60 }),
    ];

    const blocks = mapTimeEntriesToBlocks(entries, tasks, listNameMap);

    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({
      id: '1',
      taskName: 'Write tests',
      listName: 'Work',
      taskId: '10',
    });
    expect(blocks[1]).toMatchObject({
      id: '2',
      taskName: 'Review PR',
      listName: 'Personal',
      taskId: '20',
    });
  });

  it('filters out entries from other days', () => {
    const tasks = [makeTask({ id: '10', name: 'Write tests', listId: 1 })];
    const yesterday = dayjs().subtract(1, 'day');
    const entries = [
      makeEntry({ id: 1, taskId: 10, startedAt: yesterday.hour(9).toISOString(), endedAt: yesterday.hour(10).toISOString() }),
      makeEntry({ id: 2, taskId: 10, startedAt: dayjs().hour(14).toISOString(), endedAt: dayjs().hour(15).toISOString() }),
    ];

    const blocks = mapTimeEntriesToBlocks(entries, tasks, listNameMap);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].id).toBe('2');
  });

  it('handles currently running timer (endedAt = null)', () => {
    const tasks = [makeTask({ id: '10', name: 'Active task', listId: 1 })];
    const entries = [
      makeEntry({ id: 1, taskId: 10, startedAt: dayjs().hour(14).toISOString(), endedAt: null, durationMinutes: null }),
    ];

    const blocks = mapTimeEntriesToBlocks(entries, tasks, listNameMap);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].endedAt).toBeNull();
    expect(blocks[0].durationMinutes).toBeNull();
  });

  it('handles unknown task gracefully', () => {
    const entries = [
      makeEntry({ id: 1, taskId: 999, startedAt: dayjs().hour(9).toISOString(), endedAt: dayjs().hour(10).toISOString() }),
    ];

    const blocks = mapTimeEntriesToBlocks(entries, [], listNameMap);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].taskName).toBe('Unknown task');
    expect(blocks[0].listName).toBe('Unknown');
  });

  it('returns empty array when no entries', () => {
    const blocks = mapTimeEntriesToBlocks([], [], listNameMap);
    expect(blocks).toHaveLength(0);
  });

  it('includes listColor when listColorMap is provided', () => {
    const listColorMap = new Map<number, string | null>([
      [1, 'blue'],
      [2, 'violet'],
    ]);
    const tasks = [
      makeTask({ id: '10', name: 'Write tests', listId: 1 }),
      makeTask({ id: '20', name: 'Review PR', listId: 2 }),
    ];
    const entries = [
      makeEntry({ id: 1, taskId: 10, startedAt: dayjs().hour(9).toISOString(), endedAt: dayjs().hour(10).toISOString(), durationMinutes: 60 }),
      makeEntry({ id: 2, taskId: 20, startedAt: dayjs().hour(10).toISOString(), endedAt: dayjs().hour(11).toISOString(), durationMinutes: 60 }),
    ];

    const blocks = mapTimeEntriesToBlocks(entries, tasks, listNameMap, undefined, listColorMap);
    expect(blocks[0].listColor).toBe('blue');
    expect(blocks[1].listColor).toBe('violet');
  });

  it('returns null listColor when listColorMap is not provided', () => {
    const tasks = [makeTask({ id: '10', name: 'Write tests', listId: 1 })];
    const entries = [
      makeEntry({ id: 1, taskId: 10, startedAt: dayjs().hour(9).toISOString(), endedAt: dayjs().hour(10).toISOString(), durationMinutes: 60 }),
    ];

    const blocks = mapTimeEntriesToBlocks(entries, tasks, listNameMap);
    expect(blocks[0].listColor).toBeNull();
  });
});
