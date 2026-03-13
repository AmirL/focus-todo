import { describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import { aggregateTimeByList } from './aggregateTimeByList';
import type { TimeEntry } from '@/shared/api/time-entries';
import type { TaskModel } from '@/entities/task/model/task';
import type { ListModel } from '@/entities/list/model/list';
import { LIST_COLOR_HEX } from '@/shared/lib/colors';

function makeEntry(overrides: Partial<TimeEntry> & { id: number; taskId: number }): TimeEntry {
  return {
    userId: 'user1',
    startedAt: '2026-03-12T09:00:00.000Z',
    endedAt: '2026-03-12T10:00:00.000Z',
    durationMinutes: 60,
    createdAt: '2026-03-12T08:00:00.000Z',
    ...overrides,
  };
}

function makeTask(id: number, listId: number): TaskModel {
  return { id, listId } as unknown as TaskModel;
}

function makeList(id: string, name: string, color: string | null): ListModel {
  return { id, name, color } as unknown as ListModel;
}

const targetDate = dayjs('2026-03-12');

describe('aggregateTimeByList', () => {
  it('returns empty array when no time entries', () => {
    const result = aggregateTimeByList([], [], [], targetDate);
    expect(result).toEqual([]);
  });

  it('aggregates entries by list name', () => {
    const entries = [
      makeEntry({ id: 1, taskId: 1, durationMinutes: 60 }),
      makeEntry({ id: 2, taskId: 2, startedAt: '2026-03-12T10:00:00.000Z', endedAt: '2026-03-12T11:00:00.000Z', durationMinutes: 60 }),
      makeEntry({ id: 3, taskId: 3, startedAt: '2026-03-12T11:00:00.000Z', endedAt: '2026-03-12T11:30:00.000Z', durationMinutes: 30 }),
    ];
    const tasks = [makeTask(1, 10), makeTask(2, 10), makeTask(3, 20)];
    const lists = [makeList('10', 'Work', 'blue'), makeList('20', 'Personal', 'violet')];

    const result = aggregateTimeByList(entries, tasks, lists, targetDate);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: 'Work', minutes: 120, color: LIST_COLOR_HEX.blue });
    expect(result[1]).toEqual({ name: 'Personal', minutes: 30, color: LIST_COLOR_HEX.violet });
  });

  it('filters entries by date', () => {
    const entries = [
      makeEntry({ id: 1, taskId: 1, durationMinutes: 60 }),
      makeEntry({ id: 2, taskId: 1, startedAt: '2026-03-13T09:00:00.000Z', endedAt: '2026-03-13T10:00:00.000Z', durationMinutes: 60 }),
    ];
    const tasks = [makeTask(1, 10)];
    const lists = [makeList('10', 'Work', 'blue')];

    const result = aggregateTimeByList(entries, tasks, lists, targetDate);

    expect(result).toHaveLength(1);
    expect(result[0].minutes).toBe(60);
  });

  it('skips entries with zero or null duration', () => {
    const entries = [
      makeEntry({ id: 1, taskId: 1, durationMinutes: 0 }),
      makeEntry({ id: 2, taskId: 1, durationMinutes: null }),
      makeEntry({ id: 3, taskId: 1, durationMinutes: 45 }),
    ];
    const tasks = [makeTask(1, 10)];
    const lists = [makeList('10', 'Work', 'blue')];

    const result = aggregateTimeByList(entries, tasks, lists, targetDate);

    expect(result).toHaveLength(1);
    expect(result[0].minutes).toBe(45);
  });

  it('uses fallback color for unknown list color', () => {
    const entries = [makeEntry({ id: 1, taskId: 1, durationMinutes: 30 })];
    const tasks = [makeTask(1, 10)];
    const lists = [makeList('10', 'Work', null)];

    const result = aggregateTimeByList(entries, tasks, lists, targetDate);

    expect(result[0].color).toBe(LIST_COLOR_HEX.slate);
  });

  it('sorts by minutes descending', () => {
    const entries = [
      makeEntry({ id: 1, taskId: 1, durationMinutes: 30 }),
      makeEntry({ id: 2, taskId: 2, startedAt: '2026-03-12T10:00:00.000Z', endedAt: '2026-03-12T12:00:00.000Z', durationMinutes: 120 }),
    ];
    const tasks = [makeTask(1, 10), makeTask(2, 20)];
    const lists = [makeList('10', 'Work', 'blue'), makeList('20', 'Personal', 'violet')];

    const result = aggregateTimeByList(entries, tasks, lists, targetDate);

    expect(result[0].name).toBe('Personal');
    expect(result[1].name).toBe('Work');
  });

  it('handles numeric IDs passed as numbers (runtime type mismatch)', () => {
    // At runtime, IDs from the database may be numbers even though typed as strings.
    // This test simulates the actual runtime behavior where task.id and list.id are numbers.
    const entries = [
      makeEntry({ id: 1, taskId: 100, durationMinutes: 45 }),
    ];
    // Simulate runtime: task.id is a number, list.id is a number (not string)
    const tasks = [{ id: 100, listId: 5 } as unknown as TaskModel];
    const lists = [{ id: 5, name: 'Work', color: 'blue' } as unknown as ListModel];

    const result = aggregateTimeByList(entries, tasks, lists, targetDate);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Work');
    expect(result[0].minutes).toBe(45);
  });

  it('handles mixed string/number ID types', () => {
    // Task has string id, list has number id, entry has number taskId
    const entries = [
      makeEntry({ id: 1, taskId: 42, durationMinutes: 30 }),
    ];
    const tasks = [{ id: '42', listId: 7 } as unknown as TaskModel];
    const lists = [{ id: 7, name: 'Personal', color: 'violet' } as unknown as ListModel];

    const result = aggregateTimeByList(entries, tasks, lists, targetDate);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Personal');
  });
});
