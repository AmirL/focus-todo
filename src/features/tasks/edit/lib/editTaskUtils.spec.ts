import { describe, it, expect } from 'vitest';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';
import type { TaskMetadata } from '@/shared/ui/task/useTaskMetadata';
import type { AiSuggestions } from '@/shared/types/aiSuggestions';
import {
  buildUpdatedTask,
  buildTaskWithClearedSuggestions,
  applySuggestion,
  rejectSuggestion,
} from './editTaskUtils';

function createTestTask(overrides: Partial<TaskModel> = {}): TaskModel {
  return createInstance(TaskModel, {
    id: 'task-1',
    name: 'Original name',
    details: 'Original details',
    listId: 1,
    isBlocker: false,
    selectedAt: null,
    deletedAt: null,
    date: null,
    estimatedDuration: null,
    completedAt: null,
    updatedAt: new Date('2026-01-01'),
    createdAt: new Date('2026-01-01'),
    goalId: null,
    aiSuggestions: null,
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

function createSuggestions(overrides: Record<string, { suggestion: string; userReaction: 'accepted' | 'rejected' | null }> = {}): AiSuggestions {
  return {
    name: { suggestion: 'Better name', userReaction: null },
    ...overrides,
  };
}

describe('buildUpdatedTask', () => {
  it('should update name and details from form state', () => {
    const task = createTestTask();
    const result = buildUpdatedTask(task, {
      name: 'Updated name',
      details: 'Updated details',
      metadata: createMetadata(),
      aiSuggestions: null,
    });
    expect(result.name).toBe('Updated name');
    expect(result.details).toBe('Updated details');
  });

  it('should update metadata fields', () => {
    const task = createTestTask();
    const metadata = createMetadata({
      selectedDuration: 90,
      selectedListId: 2,
      isBlocker: true,
      selectedDate: new Date('2026-04-01'),
      selectedGoalId: 5,
    });
    const result = buildUpdatedTask(task, {
      name: 'Task',
      details: '',
      metadata,
      aiSuggestions: null,
    });
    expect(result.estimatedDuration).toBe(90);
    expect(result.listId).toBe(2);
    expect(result.isBlocker).toBe(true);
    expect(result.date).toEqual(new Date('2026-04-01'));
    expect(result.goalId).toBe(5);
  });

  it('should set selectedAt to new Date when starred and no existing selectedAt', () => {
    const task = createTestTask({ selectedAt: null });
    const result = buildUpdatedTask(task, {
      name: 'Task',
      details: '',
      metadata: createMetadata({ isStarred: true }),
      aiSuggestions: null,
    });
    expect(result.selectedAt).toBeInstanceOf(Date);
  });

  it('should preserve existing selectedAt when starred and selectedAt exists', () => {
    const existingDate = new Date('2026-02-15');
    const task = createTestTask({ selectedAt: existingDate });
    const result = buildUpdatedTask(task, {
      name: 'Task',
      details: '',
      metadata: createMetadata({ isStarred: true }),
      aiSuggestions: null,
    });
    expect(result.selectedAt).toEqual(existingDate);
  });

  it('should set selectedAt to null when not starred', () => {
    const task = createTestTask({ selectedAt: new Date() });
    const result = buildUpdatedTask(task, {
      name: 'Task',
      details: '',
      metadata: createMetadata({ isStarred: false }),
      aiSuggestions: null,
    });
    expect(result.selectedAt).toBeNull();
  });

  it('should include aiSuggestions in the result', () => {
    const suggestions = createSuggestions();
    const task = createTestTask();
    const result = buildUpdatedTask(task, {
      name: 'Task',
      details: '',
      metadata: createMetadata(),
      aiSuggestions: suggestions,
    });
    expect(result.aiSuggestions).toEqual(suggestions);
  });

  it('should update updatedAt timestamp', () => {
    const task = createTestTask();
    const before = new Date();
    const result = buildUpdatedTask(task, {
      name: 'Task',
      details: '',
      metadata: createMetadata(),
      aiSuggestions: null,
    });
    expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('should preserve task id', () => {
    const task = createTestTask({ id: 'my-id' });
    const result = buildUpdatedTask(task, {
      name: 'Task',
      details: '',
      metadata: createMetadata(),
      aiSuggestions: null,
    });
    expect(result.id).toBe('my-id');
  });

  it('should return a TaskModel instance', () => {
    const task = createTestTask();
    const result = buildUpdatedTask(task, {
      name: 'Task',
      details: '',
      metadata: createMetadata(),
      aiSuggestions: null,
    });
    expect(result).toBeInstanceOf(TaskModel);
  });
});

describe('buildTaskWithClearedSuggestions', () => {
  it('should set aiSuggestions to null', () => {
    const task = createTestTask({ aiSuggestions: createSuggestions() });
    const result = buildTaskWithClearedSuggestions(task, {
      name: 'Task',
      details: '',
      metadata: createMetadata(),
    });
    expect(result.aiSuggestions).toBeNull();
  });

  it('should still apply other form state', () => {
    const task = createTestTask();
    const result = buildTaskWithClearedSuggestions(task, {
      name: 'Updated name',
      details: 'Updated details',
      metadata: createMetadata({ selectedDuration: 60 }),
    });
    expect(result.name).toBe('Updated name');
    expect(result.details).toBe('Updated details');
    expect(result.estimatedDuration).toBe(60);
  });
});

describe('applySuggestion', () => {
  it('should return unchanged state when suggestions is null', () => {
    const result = applySuggestion(null, 'name');
    expect(result.updatedSuggestions).toBeNull();
    expect(result.appliedValue).toBeNull();
    expect(result.appliedDuration).toBeNull();
  });

  it('should return unchanged state when field does not exist in suggestions', () => {
    const suggestions = createSuggestions();
    const result = applySuggestion(suggestions, 'nonexistent');
    expect(result.updatedSuggestions).toEqual(suggestions);
    expect(result.appliedValue).toBeNull();
    expect(result.appliedDuration).toBeNull();
  });

  it('should apply name suggestion and mark as accepted', () => {
    const suggestions = createSuggestions({
      name: { suggestion: 'Better name', userReaction: null },
    });
    const result = applySuggestion(suggestions, 'name');
    expect(result.appliedValue).toBe('Better name');
    expect(result.appliedDuration).toBeNull();
    expect(result.updatedSuggestions!.name.userReaction).toBe('accepted');
  });

  it('should apply details suggestion', () => {
    const suggestions = createSuggestions({
      details: { suggestion: 'Better details', userReaction: null },
    });
    const result = applySuggestion(suggestions, 'details');
    expect(result.appliedValue).toBe('Better details');
    expect(result.updatedSuggestions!.details.userReaction).toBe('accepted');
  });

  it('should apply estimatedDuration suggestion as a number', () => {
    const suggestions = createSuggestions({
      estimatedDuration: { suggestion: '60', userReaction: null },
    });
    const result = applySuggestion(suggestions, 'estimatedDuration');
    expect(result.appliedDuration).toBe(60);
    expect(result.appliedValue).toBeNull();
    expect(result.updatedSuggestions!.estimatedDuration.userReaction).toBe('accepted');
  });

  it('should not apply invalid estimatedDuration suggestion', () => {
    const suggestions = createSuggestions({
      estimatedDuration: { suggestion: 'not-a-number', userReaction: null },
    });
    const result = applySuggestion(suggestions, 'estimatedDuration');
    expect(result.appliedDuration).toBeNull();
    expect(result.updatedSuggestions!.estimatedDuration.userReaction).toBe('accepted');
  });

  it('should preserve other suggestions when accepting one', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Better name', userReaction: null },
      details: { suggestion: 'Better details', userReaction: null },
    };
    const result = applySuggestion(suggestions, 'name');
    expect(result.updatedSuggestions!.name.userReaction).toBe('accepted');
    expect(result.updatedSuggestions!.details.userReaction).toBeNull();
  });
});

describe('rejectSuggestion', () => {
  it('should return null when suggestions is null', () => {
    const result = rejectSuggestion(null, 'name');
    expect(result).toBeNull();
  });

  it('should return unchanged suggestions when field does not exist', () => {
    const suggestions = createSuggestions();
    const result = rejectSuggestion(suggestions, 'nonexistent');
    expect(result).toEqual(suggestions);
  });

  it('should mark the specified suggestion as rejected', () => {
    const suggestions = createSuggestions({
      name: { suggestion: 'Better name', userReaction: null },
    });
    const result = rejectSuggestion(suggestions, 'name');
    expect(result!.name.userReaction).toBe('rejected');
  });

  it('should preserve other suggestions', () => {
    const suggestions: AiSuggestions = {
      name: { suggestion: 'Better name', userReaction: null },
      details: { suggestion: 'Better details', userReaction: null },
    };
    const result = rejectSuggestion(suggestions, 'name');
    expect(result!.name.userReaction).toBe('rejected');
    expect(result!.details.userReaction).toBeNull();
  });

  it('should preserve suggestion text when rejecting', () => {
    const suggestions = createSuggestions({
      name: { suggestion: 'Better name', userReaction: null },
    });
    const result = rejectSuggestion(suggestions, 'name');
    expect(result!.name.suggestion).toBe('Better name');
  });
});
