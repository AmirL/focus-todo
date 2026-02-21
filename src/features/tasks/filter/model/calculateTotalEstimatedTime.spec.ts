import { describe, it, expect } from 'vitest';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';
import { calculateTotalEstimatedTime } from './calculateTotalEstimatedTime';

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

describe('calculateTotalEstimatedTime', () => {
  it('should return 0 for an empty array', () => {
    expect(calculateTotalEstimatedTime([])).toBe(0);
  });

  it('should sum estimated durations of active tasks', () => {
    const tasks = [
      makeTask({ id: 't1', estimatedDuration: 30 }),
      makeTask({ id: 't2', estimatedDuration: 45 }),
      makeTask({ id: 't3', estimatedDuration: 15 }),
    ];
    expect(calculateTotalEstimatedTime(tasks)).toBe(90);
  });

  it('should exclude completed tasks from the total', () => {
    const tasks = [
      makeTask({ id: 't1', estimatedDuration: 30 }),
      makeTask({ id: 't2', estimatedDuration: 45, completedAt: new Date('2024-06-15') }),
      makeTask({ id: 't3', estimatedDuration: 15 }),
    ];
    expect(calculateTotalEstimatedTime(tasks)).toBe(45);
  });

  it('should exclude deleted tasks from the total', () => {
    const tasks = [
      makeTask({ id: 't1', estimatedDuration: 30 }),
      makeTask({ id: 't2', estimatedDuration: 45, deletedAt: new Date('2024-06-15') }),
      makeTask({ id: 't3', estimatedDuration: 15 }),
    ];
    expect(calculateTotalEstimatedTime(tasks)).toBe(45);
  });

  it('should skip tasks with null estimatedDuration', () => {
    const tasks = [
      makeTask({ id: 't1', estimatedDuration: 30 }),
      makeTask({ id: 't2', estimatedDuration: null }),
      makeTask({ id: 't3', estimatedDuration: 60 }),
    ];
    expect(calculateTotalEstimatedTime(tasks)).toBe(90);
  });

  it('should skip tasks with 0 estimatedDuration', () => {
    const tasks = [
      makeTask({ id: 't1', estimatedDuration: 30 }),
      makeTask({ id: 't2', estimatedDuration: 0 }),
      makeTask({ id: 't3', estimatedDuration: 60 }),
    ];
    // estimatedDuration of 0 is falsy, so it should be skipped
    expect(calculateTotalEstimatedTime(tasks)).toBe(90);
  });

  it('should return 0 when all tasks are completed', () => {
    const tasks = [
      makeTask({ id: 't1', estimatedDuration: 30, completedAt: new Date('2024-06-15') }),
      makeTask({ id: 't2', estimatedDuration: 45, completedAt: new Date('2024-06-15') }),
    ];
    expect(calculateTotalEstimatedTime(tasks)).toBe(0);
  });

  it('should return 0 when all tasks are deleted', () => {
    const tasks = [
      makeTask({ id: 't1', estimatedDuration: 30, deletedAt: new Date('2024-06-15') }),
      makeTask({ id: 't2', estimatedDuration: 45, deletedAt: new Date('2024-06-15') }),
    ];
    expect(calculateTotalEstimatedTime(tasks)).toBe(0);
  });

  it('should return 0 when no tasks have estimated durations', () => {
    const tasks = [
      makeTask({ id: 't1', estimatedDuration: null }),
      makeTask({ id: 't2', estimatedDuration: null }),
    ];
    expect(calculateTotalEstimatedTime(tasks)).toBe(0);
  });

  it('should handle a mix of completed, deleted, active, and null-duration tasks', () => {
    const tasks = [
      makeTask({ id: 't1', estimatedDuration: 30 }),                                        // counted: 30
      makeTask({ id: 't2', estimatedDuration: 45, completedAt: new Date('2024-06-15') }),    // excluded (completed)
      makeTask({ id: 't3', estimatedDuration: null }),                                       // excluded (null)
      makeTask({ id: 't4', estimatedDuration: 60, deletedAt: new Date('2024-06-15') }),      // excluded (deleted)
      makeTask({ id: 't5', estimatedDuration: 20 }),                                         // counted: 20
    ];
    expect(calculateTotalEstimatedTime(tasks)).toBe(50);
  });
});
