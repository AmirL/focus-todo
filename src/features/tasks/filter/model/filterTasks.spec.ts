import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';
import { StatusFilterEnum } from './filterStore';
import { applyStatusFilter } from './filterTasks';

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

describe('applyStatusFilter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('BACKLOG filter', () => {
    it('should return true for tasks with no date and no selectedAt', () => {
      const task = makeTask({ date: null, selectedAt: null });
      expect(applyStatusFilter(task, StatusFilterEnum.BACKLOG)).toBe(true);
    });

    it('should return false for tasks with a date', () => {
      const task = makeTask({ date: new Date('2024-06-15'), selectedAt: null });
      expect(applyStatusFilter(task, StatusFilterEnum.BACKLOG)).toBe(false);
    });

    it('should return false for tasks with selectedAt', () => {
      const task = makeTask({ date: null, selectedAt: new Date('2024-06-15') });
      expect(applyStatusFilter(task, StatusFilterEnum.BACKLOG)).toBe(false);
    });
  });

  describe('FUTURE filter', () => {
    it('should return true for tasks with a future date', () => {
      const task = makeTask({ date: new Date('2024-06-20T00:00:00Z') });
      expect(applyStatusFilter(task, StatusFilterEnum.FUTURE)).toBe(true);
    });

    it('should return false for tasks with today date', () => {
      const task = makeTask({ date: new Date('2024-06-15T00:00:00Z') });
      expect(applyStatusFilter(task, StatusFilterEnum.FUTURE)).toBe(false);
    });

    it('should return false for tasks with a past date', () => {
      const task = makeTask({ date: new Date('2024-06-10T00:00:00Z') });
      expect(applyStatusFilter(task, StatusFilterEnum.FUTURE)).toBe(false);
    });

    it('should return false for tasks with no date', () => {
      const task = makeTask({ date: null });
      expect(applyStatusFilter(task, StatusFilterEnum.FUTURE)).toBe(false);
    });
  });

  describe('SELECTED filter', () => {
    it('should return true for selected tasks that are not today and not in the future', () => {
      // A task that is selected, with a past date (or no date that maps to today/future)
      const task = makeTask({
        selectedAt: new Date('2024-06-14T10:00:00Z'),
        date: null,
      });
      expect(applyStatusFilter(task, StatusFilterEnum.SELECTED)).toBe(true);
    });

    it('should return false for selected tasks with today date', () => {
      const task = makeTask({
        selectedAt: new Date('2024-06-15T10:00:00Z'),
        date: new Date('2024-06-15T00:00:00Z'),
      });
      expect(applyStatusFilter(task, StatusFilterEnum.SELECTED)).toBe(false);
    });

    it('should return false for selected tasks with a future date', () => {
      const task = makeTask({
        selectedAt: new Date('2024-06-14T10:00:00Z'),
        date: new Date('2024-06-20T00:00:00Z'),
      });
      expect(applyStatusFilter(task, StatusFilterEnum.SELECTED)).toBe(false);
    });

    it('should return false for non-selected tasks', () => {
      const task = makeTask({ selectedAt: null, date: null });
      expect(applyStatusFilter(task, StatusFilterEnum.SELECTED)).toBe(false);
    });

    it('should return true for selected tasks with a past date', () => {
      const task = makeTask({
        selectedAt: new Date('2024-06-10T10:00:00Z'),
        date: new Date('2024-06-10T00:00:00Z'),
      });
      expect(applyStatusFilter(task, StatusFilterEnum.SELECTED)).toBe(true);
    });
  });

  describe('TODAY filter', () => {
    it('should return true for tasks with today date', () => {
      const task = makeTask({ date: new Date('2024-06-15T00:00:00Z') });
      expect(applyStatusFilter(task, StatusFilterEnum.TODAY)).toBeTruthy();
    });

    it('should return true for overdue tasks (past date, not completed)', () => {
      const task = makeTask({
        date: new Date('2024-06-10T00:00:00Z'),
        completedAt: null,
      });
      expect(applyStatusFilter(task, StatusFilterEnum.TODAY)).toBeTruthy();
    });

    it('should return false for future tasks', () => {
      const task = makeTask({ date: new Date('2024-06-20T00:00:00Z') });
      expect(applyStatusFilter(task, StatusFilterEnum.TODAY)).toBeFalsy();
    });

    it('should return false for tasks with no date', () => {
      const task = makeTask({ date: null });
      expect(applyStatusFilter(task, StatusFilterEnum.TODAY)).toBeFalsy();
    });

    it('should return false for overdue but completed tasks', () => {
      const task = makeTask({
        date: new Date('2024-06-10T00:00:00Z'),
        completedAt: new Date('2024-06-10T12:00:00Z'),
      });
      // isTaskToday returns false (not today), isTaskOverdue returns false (completed)
      expect(applyStatusFilter(task, StatusFilterEnum.TODAY)).toBeFalsy();
    });
  });

  describe('TOMORROW filter', () => {
    it('should return true for tasks with tomorrow date', () => {
      const task = makeTask({ date: new Date('2024-06-16T00:00:00Z') });
      expect(applyStatusFilter(task, StatusFilterEnum.TOMORROW)).toBeTruthy();
    });

    it('should return false for tasks with today date', () => {
      const task = makeTask({ date: new Date('2024-06-15T00:00:00Z') });
      expect(applyStatusFilter(task, StatusFilterEnum.TOMORROW)).toBeFalsy();
    });

    it('should return false for tasks with a future date beyond tomorrow', () => {
      const task = makeTask({ date: new Date('2024-06-20T00:00:00Z') });
      expect(applyStatusFilter(task, StatusFilterEnum.TOMORROW)).toBeFalsy();
    });

    it('should return false for tasks with no date', () => {
      const task = makeTask({ date: null });
      expect(applyStatusFilter(task, StatusFilterEnum.TOMORROW)).toBeFalsy();
    });
  });

  describe('filter combinations with multiple tasks', () => {
    it('should correctly filter an array of tasks for BACKLOG', () => {
      const tasks = [
        makeTask({ id: 't1', date: null, selectedAt: null }),          // backlog
        makeTask({ id: 't2', date: new Date('2024-06-20'), selectedAt: null }), // future
        makeTask({ id: 't3', date: null, selectedAt: new Date('2024-06-14') }), // selected
        makeTask({ id: 't4', date: null, selectedAt: null }),          // backlog
      ];

      const backlogTasks = tasks.filter((t) => applyStatusFilter(t, StatusFilterEnum.BACKLOG));
      expect(backlogTasks).toHaveLength(2);
      expect(backlogTasks[0].id).toBe('t1');
      expect(backlogTasks[1].id).toBe('t4');
    });

    it('should correctly filter an array of tasks for TODAY', () => {
      const tasks = [
        makeTask({ id: 't1', date: new Date('2024-06-15T00:00:00Z') }),             // today
        makeTask({ id: 't2', date: new Date('2024-06-10T00:00:00Z'), completedAt: null }), // overdue
        makeTask({ id: 't3', date: new Date('2024-06-20T00:00:00Z') }),             // future
        makeTask({ id: 't4', date: null }),                                          // no date
      ];

      const todayTasks = tasks.filter((t) => applyStatusFilter(t, StatusFilterEnum.TODAY));
      expect(todayTasks).toHaveLength(2);
      expect(todayTasks[0].id).toBe('t1');
      expect(todayTasks[1].id).toBe('t2');
    });
  });
});
