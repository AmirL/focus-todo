import { describe, it, expect } from 'vitest';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';
import {
  buildToggledBlockerTask,
  buildToggledStarTask,
  buildToggledDeleteTask,
  buildSnoozedTask,
  buildDurationChangedTask,
} from './taskActionUtils';

function createTestTask(overrides: Partial<TaskModel> = {}): TaskModel {
  return createInstance(TaskModel, {
    id: 'test-1',
    name: 'Test task',
    details: '',
    listId: 1,
    isBlocker: false,
    selectedAt: null,
    deletedAt: null,
    date: null,
    estimatedDuration: null,
    updatedAt: new Date('2026-01-01'),
    createdAt: new Date('2026-01-01'),
    ...overrides,
  });
}

describe('buildToggledBlockerTask', () => {
  it('should set isBlocker to true when currently false', () => {
    const task = createTestTask({ isBlocker: false });
    const result = buildToggledBlockerTask(task);
    expect(result.isBlocker).toBe(true);
  });

  it('should set isBlocker to false when currently true', () => {
    const task = createTestTask({ isBlocker: true });
    const result = buildToggledBlockerTask(task);
    expect(result.isBlocker).toBe(false);
  });

  it('should update updatedAt timestamp', () => {
    const task = createTestTask();
    const before = new Date();
    const result = buildToggledBlockerTask(task);
    expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should preserve other task properties', () => {
    const task = createTestTask({ name: 'My task', listId: 2 });
    const result = buildToggledBlockerTask(task);
    expect(result.name).toBe('My task');
    expect(result.listId).toBe(2);
    expect(result.id).toBe('test-1');
  });

  it('should return a TaskModel instance', () => {
    const task = createTestTask();
    const result = buildToggledBlockerTask(task);
    expect(result).toBeInstanceOf(TaskModel);
  });
});

describe('buildToggledStarTask', () => {
  it('should set selectedAt to a date when currently null', () => {
    const task = createTestTask({ selectedAt: null });
    const result = buildToggledStarTask(task);
    expect(result.selectedAt).toBeInstanceOf(Date);
  });

  it('should set selectedAt to null when currently selected', () => {
    const task = createTestTask({ selectedAt: new Date('2026-01-15') });
    const result = buildToggledStarTask(task);
    expect(result.selectedAt).toBeNull();
  });

  it('should update updatedAt timestamp', () => {
    const task = createTestTask();
    const before = new Date();
    const result = buildToggledStarTask(task);
    expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should preserve other task properties', () => {
    const task = createTestTask({ name: 'Starred task', isBlocker: true });
    const result = buildToggledStarTask(task);
    expect(result.name).toBe('Starred task');
    expect(result.isBlocker).toBe(true);
  });
});

describe('buildToggledDeleteTask', () => {
  it('should set deletedAt to a date when currently null', () => {
    const task = createTestTask({ deletedAt: null });
    const result = buildToggledDeleteTask(task);
    expect(result.deletedAt).toBeInstanceOf(Date);
  });

  it('should set deletedAt to null when currently deleted', () => {
    const task = createTestTask({ deletedAt: new Date('2026-01-10') });
    const result = buildToggledDeleteTask(task);
    expect(result.deletedAt).toBeNull();
  });

  it('should update updatedAt timestamp', () => {
    const task = createTestTask({ deletedAt: new Date() });
    const before = new Date();
    const result = buildToggledDeleteTask(task);
    expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should preserve other task properties', () => {
    const task = createTestTask({ name: 'Delete me', estimatedDuration: 30 });
    const result = buildToggledDeleteTask(task);
    expect(result.name).toBe('Delete me');
    expect(result.estimatedDuration).toBe(30);
  });
});

describe('buildSnoozedTask', () => {
  it('should set the date to the provided value', () => {
    const task = createTestTask();
    const snoozeDate = new Date('2026-03-25');
    const result = buildSnoozedTask(task, snoozeDate);
    expect(result.date).toEqual(snoozeDate);
  });

  it('should clear the date when null is provided', () => {
    const task = createTestTask({ date: new Date('2026-03-20') });
    const result = buildSnoozedTask(task, null);
    expect(result.date).toBeNull();
  });

  it('should update updatedAt timestamp', () => {
    const task = createTestTask();
    const before = new Date();
    const result = buildSnoozedTask(task, new Date());
    expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should preserve other task properties', () => {
    const task = createTestTask({ name: 'Snooze me', isBlocker: true });
    const result = buildSnoozedTask(task, new Date());
    expect(result.name).toBe('Snooze me');
    expect(result.isBlocker).toBe(true);
  });
});

describe('buildDurationChangedTask', () => {
  it('should set the estimatedDuration to the provided minutes', () => {
    const task = createTestTask();
    const result = buildDurationChangedTask(task, 60);
    expect(result.estimatedDuration).toBe(60);
  });

  it('should clear duration when null is provided', () => {
    const task = createTestTask({ estimatedDuration: 30 });
    const result = buildDurationChangedTask(task, null);
    expect(result.estimatedDuration).toBeNull();
  });

  it('should handle various duration values', () => {
    const task = createTestTask();
    expect(buildDurationChangedTask(task, 15).estimatedDuration).toBe(15);
    expect(buildDurationChangedTask(task, 90).estimatedDuration).toBe(90);
    expect(buildDurationChangedTask(task, 480).estimatedDuration).toBe(480);
  });

  it('should update updatedAt timestamp', () => {
    const task = createTestTask();
    const before = new Date();
    const result = buildDurationChangedTask(task, 30);
    expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should preserve other task properties', () => {
    const task = createTestTask({ name: 'Duration task', listId: 3 });
    const result = buildDurationChangedTask(task, 60);
    expect(result.name).toBe('Duration task');
    expect(result.listId).toBe(3);
  });
});
