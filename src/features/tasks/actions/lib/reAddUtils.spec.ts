import { describe, it, expect } from 'vitest';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';
import type { TaskMetadata } from '@/shared/ui/task/useTaskMetadata';
import { buildCompletedOriginalTask, buildReAddedTask } from './reAddUtils';

function createTestTask(overrides: Partial<TaskModel> = {}): TaskModel {
  return createInstance(TaskModel, {
    id: 'task-1',
    name: 'Original task',
    details: 'Some details',
    listId: 1,
    isBlocker: false,
    selectedAt: null,
    deletedAt: null,
    date: null,
    estimatedDuration: 30,
    completedAt: null,
    updatedAt: new Date('2026-01-01'),
    createdAt: new Date('2026-01-01'),
    ...overrides,
  });
}

function createMetadata(overrides: Partial<TaskMetadata> = {}): TaskMetadata {
  return {
    selectedDuration: null,
    selectedListId: 1,
    isStarred: false,
    isBlocker: false,
    selectedDate: null,
    selectedGoalId: null,
    ...overrides,
  };
}

describe('buildCompletedOriginalTask', () => {
  it('should set completedAt to a date', () => {
    const task = createTestTask({ completedAt: null });
    const result = buildCompletedOriginalTask(task);
    expect(result.completedAt).toBeInstanceOf(Date);
  });

  it('should update updatedAt timestamp', () => {
    const task = createTestTask();
    const before = new Date();
    const result = buildCompletedOriginalTask(task);
    expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should preserve other task properties', () => {
    const task = createTestTask({ name: 'Complete me', listId: 2, isBlocker: true });
    const result = buildCompletedOriginalTask(task);
    expect(result.name).toBe('Complete me');
    expect(result.listId).toBe(2);
    expect(result.isBlocker).toBe(true);
    expect(result.id).toBe('task-1');
  });

  it('should return a TaskModel instance', () => {
    const task = createTestTask();
    const result = buildCompletedOriginalTask(task);
    expect(result).toBeInstanceOf(TaskModel);
  });
});

describe('buildReAddedTask', () => {
  it('should create a task with provided name and details', () => {
    const metadata = createMetadata();
    const result = buildReAddedTask('New task', 'New details', metadata);
    expect(result.name).toBe('New task');
    expect(result.details).toBe('New details');
  });

  it('should trim whitespace from details', () => {
    const metadata = createMetadata();
    const result = buildReAddedTask('Task', '  details with spaces  ', metadata);
    expect(result.details).toBe('details with spaces');
  });

  it('should set listId from metadata', () => {
    const metadata = createMetadata({ selectedListId: 3 });
    const result = buildReAddedTask('Task', '', metadata);
    expect(result.listId).toBe(3);
  });

  it('should set selectedAt when starred', () => {
    const metadata = createMetadata({ isStarred: true });
    const result = buildReAddedTask('Task', '', metadata);
    expect(result.selectedAt).toBeInstanceOf(Date);
  });

  it('should set selectedAt to null when not starred', () => {
    const metadata = createMetadata({ isStarred: false });
    const result = buildReAddedTask('Task', '', metadata);
    expect(result.selectedAt).toBeNull();
  });

  it('should set isBlocker from metadata', () => {
    const metadata = createMetadata({ isBlocker: true });
    const result = buildReAddedTask('Task', '', metadata);
    expect(result.isBlocker).toBe(true);
  });

  it('should set date from metadata', () => {
    const date = new Date('2026-04-01');
    const metadata = createMetadata({ selectedDate: date });
    const result = buildReAddedTask('Task', '', metadata);
    expect(result.date).toEqual(date);
  });

  it('should set estimatedDuration from metadata', () => {
    const metadata = createMetadata({ selectedDuration: 60 });
    const result = buildReAddedTask('Task', '', metadata);
    expect(result.estimatedDuration).toBe(60);
  });

  it('should set estimatedDuration to null when metadata has null', () => {
    const metadata = createMetadata({ selectedDuration: null });
    const result = buildReAddedTask('Task', '', metadata);
    expect(result.estimatedDuration).toBeNull();
  });

  it('should return a TaskModel instance', () => {
    const metadata = createMetadata();
    const result = buildReAddedTask('Task', '', metadata);
    expect(result).toBeInstanceOf(TaskModel);
  });
});
