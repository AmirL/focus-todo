import { describe, it, expect, beforeEach } from 'vitest';
import { useEditTaskModalStore } from './editTaskModalStore';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';

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

describe('useEditTaskModalStore', () => {
  beforeEach(() => {
    // Reset store state
    useEditTaskModalStore.setState({ open: false, task: null });
  });

  it('should start with modal closed and no task', () => {
    const state = useEditTaskModalStore.getState();
    expect(state.open).toBe(false);
    expect(state.task).toBeNull();
  });

  it('should open modal with a task', () => {
    const task = makeTask({ id: 'task-42', name: 'Edit me' });
    useEditTaskModalStore.getState().openWithTask(task);

    const state = useEditTaskModalStore.getState();
    expect(state.open).toBe(true);
    expect(state.task).toBe(task);
    expect(state.task?.id).toBe('task-42');
  });

  it('should close modal and clear task', () => {
    const task = makeTask();
    useEditTaskModalStore.getState().openWithTask(task);
    useEditTaskModalStore.getState().close();

    const state = useEditTaskModalStore.getState();
    expect(state.open).toBe(false);
    expect(state.task).toBeNull();
  });
});
