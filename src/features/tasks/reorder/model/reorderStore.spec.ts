import { describe, it, expect, beforeEach } from 'vitest';
import { useReorderStore } from './reorderStore';
import { TaskModel } from '@/entities/task/model/task';

function makeMockTask(overrides: Partial<TaskModel> = {}): TaskModel {
  return {
    id: '1',
    name: 'Test Task',
    sortOrder: 0,
    ...overrides,
  } as TaskModel;
}

describe('useReorderStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useReorderStore.setState({
      optimisticTasks: null,
      isDragging: false,
    });
  });

  it('has correct initial state', () => {
    const state = useReorderStore.getState();
    expect(state.optimisticTasks).toBeNull();
    expect(state.isDragging).toBe(false);
  });

  it('setOptimisticTasks stores tasks', () => {
    const tasks = [makeMockTask({ id: '1' }), makeMockTask({ id: '2' })];
    useReorderStore.getState().setOptimisticTasks(tasks);
    expect(useReorderStore.getState().optimisticTasks).toEqual(tasks);
  });

  it('clearOptimisticTasks resets to null', () => {
    const tasks = [makeMockTask({ id: '1' })];
    useReorderStore.getState().setOptimisticTasks(tasks);
    expect(useReorderStore.getState().optimisticTasks).not.toBeNull();

    useReorderStore.getState().clearOptimisticTasks();
    expect(useReorderStore.getState().optimisticTasks).toBeNull();
  });

  it('setIsDragging updates dragging state', () => {
    useReorderStore.getState().setIsDragging(true);
    expect(useReorderStore.getState().isDragging).toBe(true);

    useReorderStore.getState().setIsDragging(false);
    expect(useReorderStore.getState().isDragging).toBe(false);
  });

  it('setOptimisticTasks replaces previous tasks', () => {
    const tasks1 = [makeMockTask({ id: '1' })];
    const tasks2 = [makeMockTask({ id: '2' }), makeMockTask({ id: '3' })];

    useReorderStore.getState().setOptimisticTasks(tasks1);
    expect(useReorderStore.getState().optimisticTasks).toHaveLength(1);

    useReorderStore.getState().setOptimisticTasks(tasks2);
    expect(useReorderStore.getState().optimisticTasks).toHaveLength(2);
    expect(useReorderStore.getState().optimisticTasks![0].id).toBe('2');
  });

  it('actions do not interfere with each other', () => {
    const tasks = [makeMockTask({ id: '1' })];
    useReorderStore.getState().setOptimisticTasks(tasks);
    useReorderStore.getState().setIsDragging(true);

    expect(useReorderStore.getState().optimisticTasks).toEqual(tasks);
    expect(useReorderStore.getState().isDragging).toBe(true);

    useReorderStore.getState().clearOptimisticTasks();
    expect(useReorderStore.getState().optimisticTasks).toBeNull();
    expect(useReorderStore.getState().isDragging).toBe(true);
  });
});
