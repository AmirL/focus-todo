import { describe, it, expect } from 'vitest';
import { buildNewTask, getStatusDefaults, isValidTaskName } from './addTaskUtils';
import type { TaskMetadata } from '@/shared/ui/task/useTaskMetadata';
import dayjs from 'dayjs';

function makeMetadata(overrides: Partial<TaskMetadata> = {}): TaskMetadata {
  return {
    selectedListId: 1,
    selectedDuration: null,
    isStarred: false,
    isBlocker: false,
    selectedDate: null,
    selectedGoalId: null,
    ...overrides,
  };
}

describe('buildNewTask', () => {
  it('creates a task with trimmed name and details', () => {
    const task = buildNewTask('  Buy groceries  ', '  milk, eggs  ', makeMetadata());
    expect(task.name).toBe('Buy groceries');
    expect(task.details).toBe('milk, eggs');
  });

  it('sets listId from metadata', () => {
    const task = buildNewTask('Task', '', makeMetadata({ selectedListId: 42 }));
    expect(task.listId).toBe(42);
  });

  it('sets selectedAt when starred', () => {
    const task = buildNewTask('Task', '', makeMetadata({ isStarred: true }));
    expect(task.selectedAt).toBeInstanceOf(Date);
  });

  it('sets selectedAt to null when not starred', () => {
    const task = buildNewTask('Task', '', makeMetadata({ isStarred: false }));
    expect(task.selectedAt).toBeNull();
  });

  it('sets isBlocker from metadata', () => {
    const task = buildNewTask('Task', '', makeMetadata({ isBlocker: true }));
    expect(task.isBlocker).toBe(true);
  });

  it('sets date from metadata', () => {
    const date = new Date('2026-03-20');
    const task = buildNewTask('Task', '', makeMetadata({ selectedDate: date }));
    expect(task.date).toEqual(date);
  });

  it('sets estimatedDuration from metadata', () => {
    const task = buildNewTask('Task', '', makeMetadata({ selectedDuration: 30 }));
    expect(task.estimatedDuration).toBe(30);
  });

  it('sets goalId from metadata', () => {
    const task = buildNewTask('Task', '', makeMetadata({ selectedGoalId: 5 }));
    expect(task.goalId).toBe(5);
  });
});

describe('getStatusDefaults', () => {
  it('returns selectedDate for today filter', () => {
    const defaults = getStatusDefaults('today');
    expect(defaults.selectedDate).toBeInstanceOf(Date);
    expect(dayjs(defaults.selectedDate).isSame(dayjs(), 'day')).toBe(true);
  });

  it('returns selectedDate for tomorrow filter', () => {
    const defaults = getStatusDefaults('tomorrow');
    expect(defaults.selectedDate).toBeInstanceOf(Date);
    expect(dayjs(defaults.selectedDate).isSame(dayjs().add(1, 'day'), 'day')).toBe(true);
  });

  it('returns isStarred for selected filter', () => {
    const defaults = getStatusDefaults('selected');
    expect(defaults.isStarred).toBe(true);
  });

  it('returns empty object for all filter', () => {
    const defaults = getStatusDefaults('all');
    expect(defaults).toEqual({});
  });

  it('returns empty object for deleted filter', () => {
    const defaults = getStatusDefaults('deleted');
    expect(defaults).toEqual({});
  });
});

describe('isValidTaskName', () => {
  it('returns true for non-empty trimmed name', () => {
    expect(isValidTaskName('Buy groceries')).toBe(true);
  });

  it('returns true for name with surrounding whitespace', () => {
    expect(isValidTaskName('  Buy groceries  ')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isValidTaskName('')).toBe(false);
  });

  it('returns false for whitespace-only string', () => {
    expect(isValidTaskName('   ')).toBe(false);
  });
});
