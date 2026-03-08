import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import {
  TaskModel,
  isTaskInFuture,
  isTaskInBacklog,
  isTaskDeleted,
  isTaskDeletedAgo,
  isTaskCompletedAgo,
  isTaskSelected,
  isTaskToday,
  isTaskTomorrow,
  isTaskOverdue,
} from './task';
import type { TaskPlain } from './task';
import { createInstance } from '@/shared/lib/instance-tools';

dayjs.extend(utc);

function makeTaskPlain(overrides: Partial<TaskPlain> = {}): TaskPlain {
  return {
    id: 'task-1',
    name: 'Test Task',
    details: '',
    selectedAt: null,
    date: null,
    completedAt: null,
    listId: 1,
    deletedAt: null,
    createdAt: '2024-01-01 00:00:00',
    estimatedDuration: null,
    isBlocker: false,
    updatedAt: '2024-01-01 00:00:00',
    sortOrder: 0,
    aiSuggestions: null,
    goalId: null,
    ...overrides,
  };
}

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

describe('TaskModel', () => {
  describe('toInstance', () => {
    it('should create a TaskModel instance from plain data', () => {
      const plain = makeTaskPlain();
      const task = TaskModel.toInstance(plain);

      expect(task).toBeInstanceOf(TaskModel);
      expect(task.id).toBe('task-1');
      expect(task.name).toBe('Test Task');
      expect(task.details).toBe('');
      expect(task.listId).toBe(1);
    });

    it('should handle all fields correctly', () => {
      const plain = makeTaskPlain({
        id: 'task-42',
        name: 'Important Task',
        details: 'Some details here',
        selectedAt: '2024-06-15 10:00:00',
        date: '2024-06-15 00:00:00',
        completedAt: '2024-06-15 12:00:00',
        listId: 2,
        deletedAt: null,
        estimatedDuration: 30,
        isBlocker: true,
        sortOrder: 5,
        goalId: 3,
      });

      const task = TaskModel.toInstance(plain);

      expect(task.id).toBe('task-42');
      expect(task.name).toBe('Important Task');
      expect(task.details).toBe('Some details here');
      expect(task.listId).toBe(2);
      expect(task.estimatedDuration).toBe(30);
      expect(task.isBlocker).toBe(true);
      expect(task.sortOrder).toBe(5);
      expect(task.goalId).toBe(3);
    });

    it('should handle null optional fields', () => {
      const plain = makeTaskPlain({
        selectedAt: null,
        date: null,
        completedAt: null,
        deletedAt: null,
        estimatedDuration: null,
        goalId: null,
      });

      const task = TaskModel.toInstance(plain);

      expect(task.selectedAt).toBeNull();
      expect(task.date).toBeNull();
      expect(task.completedAt).toBeNull();
      expect(task.deletedAt).toBeNull();
      expect(task.estimatedDuration).toBeNull();
      expect(task.goalId).toBeNull();
    });

    it('should handle aiSuggestions field', () => {
      const plain = makeTaskPlain({
        aiSuggestions: {
          name: { suggestion: 'Better name', userReaction: null },
          details: { suggestion: 'Better details', userReaction: 'accepted' },
        },
      });

      const task = TaskModel.toInstance(plain);

      expect(task.aiSuggestions).toEqual({
        name: { suggestion: 'Better name', userReaction: null },
        details: { suggestion: 'Better details', userReaction: 'accepted' },
      });
    });
  });

  describe('fromPlainArray', () => {
    it('should convert an array of plain objects to TaskModel instances', () => {
      const plains = [
        makeTaskPlain({ id: 'task-1', name: 'First' }),
        makeTaskPlain({ id: 'task-2', name: 'Second' }),
        makeTaskPlain({ id: 'task-3', name: 'Third' }),
      ];

      const tasks = TaskModel.fromPlainArray(plains);

      expect(tasks).toHaveLength(3);
      expect(tasks[0]).toBeInstanceOf(TaskModel);
      expect(tasks[1]).toBeInstanceOf(TaskModel);
      expect(tasks[2]).toBeInstanceOf(TaskModel);
      expect(tasks[0].id).toBe('task-1');
      expect(tasks[1].id).toBe('task-2');
      expect(tasks[2].id).toBe('task-3');
    });

    it('should return an empty array when given an empty array', () => {
      const tasks = TaskModel.fromPlainArray([]);
      expect(tasks).toEqual([]);
    });
  });

  describe('toPlain', () => {
    it('should convert a TaskModel instance to a plain object', () => {
      const task = makeTask({
        id: 'task-1',
        name: 'Test Task',
        details: 'Details',
        listId: 1,
        completedAt: null,
        selectedAt: null,
        date: null,
        deletedAt: null,
      });

      const plain = TaskModel.toPlain(task);

      expect(plain.id).toBe('task-1');
      expect(plain.name).toBe('Test Task');
      expect(plain.details).toBe('Details');
      expect(plain.listId).toBe(1);
    });

    it('should transform dates to UTC strings', () => {
      const task = makeTask({
        createdAt: new Date('2024-06-15T10:30:00Z'),
        updatedAt: new Date('2024-06-15T11:00:00Z'),
        completedAt: new Date('2024-06-15T12:00:00Z'),
        selectedAt: new Date('2024-06-15T08:00:00Z'),
        date: new Date('2024-06-15T00:00:00Z'),
      });

      const plain = TaskModel.toPlain(task);

      expect(plain.createdAt).toBe('2024-06-15 10:30:00');
      expect(plain.updatedAt).toBe('2024-06-15 11:00:00');
      expect(plain.completedAt).toBe('2024-06-15 12:00:00');
      expect(plain.selectedAt).toBe('2024-06-15 08:00:00');
      expect(plain.date).toBe('2024-06-15 00:00:00');
    });

    it('should transform null dates to null', () => {
      const task = makeTask({
        completedAt: null,
        selectedAt: null,
        date: null,
        deletedAt: null,
      });

      const plain = TaskModel.toPlain(task);

      expect(plain.completedAt).toBeNull();
      expect(plain.selectedAt).toBeNull();
      expect(plain.date).toBeNull();
      expect(plain.deletedAt).toBeNull();
    });
  });

  describe('default values', () => {
    it('should have default isBlocker as false', () => {
      const task = new TaskModel();
      expect(task.isBlocker).toBe(false);
    });

    it('should have default sortOrder as 0', () => {
      const task = new TaskModel();
      expect(task.sortOrder).toBe(0);
    });

    it('should have default aiSuggestions as null', () => {
      const task = new TaskModel();
      expect(task.aiSuggestions).toBeNull();
    });

    it('should have default goalId as null', () => {
      const task = new TaskModel();
      expect(task.goalId).toBeNull();
    });
  });
});

describe('isTaskInFuture', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true for a task with a future date', () => {
    const task = makeTask({ date: new Date('2024-06-17T00:00:00Z') });
    expect(isTaskInFuture(task)).toBe(true);
  });

  it('should return false for a task with today date', () => {
    const task = makeTask({ date: new Date('2024-06-15T00:00:00Z') });
    expect(isTaskInFuture(task)).toBe(false);
  });

  it('should return false for a task with a past date', () => {
    const task = makeTask({ date: new Date('2024-06-10T00:00:00Z') });
    expect(isTaskInFuture(task)).toBe(false);
  });

  it('should return false for a task with no date', () => {
    const task = makeTask({ date: null });
    expect(isTaskInFuture(task)).toBe(false);
  });

  it('should return false for a task with undefined date', () => {
    const task = makeTask({ date: undefined });
    expect(isTaskInFuture(task)).toBe(false);
  });

  it('should return true for tomorrow at start of day', () => {
    const task = makeTask({ date: new Date('2024-06-16T00:00:01Z') });
    expect(isTaskInFuture(task)).toBe(true);
  });
});

describe('isTaskInBacklog', () => {
  it('should return true when task has no date and no selectedAt', () => {
    const task = makeTask({ date: null, selectedAt: null });
    expect(isTaskInBacklog(task)).toBe(true);
  });

  it('should return false when task has a date', () => {
    const task = makeTask({ date: new Date('2024-06-15'), selectedAt: null });
    expect(isTaskInBacklog(task)).toBe(false);
  });

  it('should return false when task has selectedAt', () => {
    const task = makeTask({ date: null, selectedAt: new Date('2024-06-15') });
    expect(isTaskInBacklog(task)).toBe(false);
  });

  it('should return false when task has both date and selectedAt', () => {
    const task = makeTask({
      date: new Date('2024-06-15'),
      selectedAt: new Date('2024-06-15'),
    });
    expect(isTaskInBacklog(task)).toBe(false);
  });

  it('should return true when date is undefined and selectedAt is undefined', () => {
    const task = makeTask({ date: undefined, selectedAt: undefined });
    expect(isTaskInBacklog(task)).toBe(true);
  });
});

describe('isTaskDeleted', () => {
  it('should return true when task has a deletedAt date', () => {
    const task = makeTask({ deletedAt: new Date('2024-06-15') });
    expect(isTaskDeleted(task)).toBe(true);
  });

  it('should return false when task has no deletedAt', () => {
    const task = makeTask({ deletedAt: null });
    expect(isTaskDeleted(task)).toBe(false);
  });

  it('should return false when deletedAt is undefined', () => {
    const task = makeTask({ deletedAt: undefined });
    expect(isTaskDeleted(task)).toBe(false);
  });
});

describe('isTaskDeletedAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true when task was deleted more than a day ago', () => {
    const task = makeTask({ deletedAt: new Date('2024-06-13T12:00:00Z') });
    expect(isTaskDeletedAgo(task)).toBe(true);
  });

  it('should return false when task was deleted less than a day ago', () => {
    const task = makeTask({ deletedAt: new Date('2024-06-15T10:00:00Z') });
    expect(isTaskDeletedAgo(task)).toBe(false);
  });

  it('should return false when task is not deleted', () => {
    const task = makeTask({ deletedAt: null });
    expect(isTaskDeletedAgo(task)).toBe(false);
  });

  it('should return true when task was deleted exactly more than 1 day ago', () => {
    const task = makeTask({ deletedAt: new Date('2024-06-14T11:59:59Z') });
    expect(isTaskDeletedAgo(task)).toBe(true);
  });

  it('should return false when task was deleted exactly 1 day ago', () => {
    // dayjs().subtract(1, 'day') from 2024-06-15T12:00 = 2024-06-14T12:00
    // isBefore means strictly before, so same time is not before
    const task = makeTask({ deletedAt: new Date('2024-06-14T12:00:00Z') });
    expect(isTaskDeletedAgo(task)).toBe(false);
  });
});

describe('isTaskCompletedAgo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true when task was completed more than a day ago', () => {
    const task = makeTask({ completedAt: new Date('2024-06-13T10:00:00Z') });
    expect(isTaskCompletedAgo(task)).toBe(true);
  });

  it('should return false when task was completed less than a day ago', () => {
    const task = makeTask({ completedAt: new Date('2024-06-15T10:00:00Z') });
    expect(isTaskCompletedAgo(task)).toBe(false);
  });

  it('should return false when task is not completed', () => {
    const task = makeTask({ completedAt: null });
    expect(isTaskCompletedAgo(task)).toBe(false);
  });

  it('should return false when completedAt is undefined', () => {
    const task = makeTask({ completedAt: undefined });
    expect(isTaskCompletedAgo(task)).toBe(false);
  });
});

describe('isTaskSelected', () => {
  it('should return true when task has selectedAt', () => {
    const task = makeTask({ selectedAt: new Date('2024-06-15') });
    expect(isTaskSelected(task)).toBe(true);
  });

  it('should return false when selectedAt is null', () => {
    const task = makeTask({ selectedAt: null });
    expect(isTaskSelected(task)).toBe(false);
  });

  it('should return false when selectedAt is undefined', () => {
    const task = makeTask({ selectedAt: undefined });
    expect(isTaskSelected(task)).toBe(false);
  });
});

describe('isTaskToday', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true when task date is today', () => {
    const task = makeTask({ date: new Date('2024-06-15T00:00:00Z') });
    expect(isTaskToday(task)).toBeTruthy();
  });

  it('should return true when task date is today at any time', () => {
    const task = makeTask({ date: new Date('2024-06-15T18:00:00Z') });
    expect(isTaskToday(task)).toBeTruthy();
  });

  it('should return false when task date is tomorrow', () => {
    const task = makeTask({ date: new Date('2024-06-16T00:00:00Z') });
    expect(isTaskToday(task)).toBeFalsy();
  });

  it('should return false when task date is yesterday', () => {
    const task = makeTask({ date: new Date('2024-06-14T00:00:00Z') });
    expect(isTaskToday(task)).toBeFalsy();
  });

  it('should return falsy when task has no date', () => {
    const task = makeTask({ date: null });
    expect(isTaskToday(task)).toBeFalsy();
  });

  it('should return falsy when task date is undefined', () => {
    const task = makeTask({ date: undefined });
    expect(isTaskToday(task)).toBeFalsy();
  });
});

describe('isTaskTomorrow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true when task date is tomorrow', () => {
    const task = makeTask({ date: new Date('2024-06-16T00:00:00Z') });
    expect(isTaskTomorrow(task)).toBeTruthy();
  });

  it('should return true when task date is tomorrow at any time', () => {
    const task = makeTask({ date: new Date('2024-06-16T18:00:00Z') });
    expect(isTaskTomorrow(task)).toBeTruthy();
  });

  it('should return false when task date is today', () => {
    const task = makeTask({ date: new Date('2024-06-15T00:00:00Z') });
    expect(isTaskTomorrow(task)).toBeFalsy();
  });

  it('should return false when task date is day after tomorrow', () => {
    const task = makeTask({ date: new Date('2024-06-17T00:00:00Z') });
    expect(isTaskTomorrow(task)).toBeFalsy();
  });

  it('should return falsy when task has no date', () => {
    const task = makeTask({ date: null });
    expect(isTaskTomorrow(task)).toBeFalsy();
  });

  it('should return falsy when task date is undefined', () => {
    const task = makeTask({ date: undefined });
    expect(isTaskTomorrow(task)).toBeFalsy();
  });
});

describe('isTaskOverdue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true when task date is in the past and not completed', () => {
    const task = makeTask({
      date: new Date('2024-06-14T00:00:00Z'),
      completedAt: null,
    });
    expect(isTaskOverdue(task)).toBeTruthy();
  });

  it('should return false when task date is in the past but completed', () => {
    const task = makeTask({
      date: new Date('2024-06-14T00:00:00Z'),
      completedAt: new Date('2024-06-14T10:00:00Z'),
    });
    expect(isTaskOverdue(task)).toBeFalsy();
  });

  it('should return false when task date is today', () => {
    const task = makeTask({
      date: new Date('2024-06-15T00:00:00Z'),
      completedAt: null,
    });
    expect(isTaskOverdue(task)).toBeFalsy();
  });

  it('should return false when task date is in the future', () => {
    const task = makeTask({
      date: new Date('2024-06-16T00:00:00Z'),
      completedAt: null,
    });
    expect(isTaskOverdue(task)).toBeFalsy();
  });

  it('should return falsy when task has no date', () => {
    const task = makeTask({ date: null, completedAt: null });
    expect(isTaskOverdue(task)).toBeFalsy();
  });

  it('should return true for a task overdue by several days', () => {
    const task = makeTask({
      date: new Date('2024-06-10T00:00:00Z'),
      completedAt: null,
    });
    expect(isTaskOverdue(task)).toBeTruthy();
  });
});
