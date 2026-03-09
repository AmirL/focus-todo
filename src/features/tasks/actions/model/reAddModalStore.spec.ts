import { describe, it, expect, beforeEach } from 'vitest';
import { useReAddModalStore } from './reAddModalStore';
import { TaskModel } from '@/entities/task/model/task';

function makeMockTask(overrides: Partial<TaskModel> = {}): TaskModel {
  return {
    id: '1',
    name: 'Test Task',
    sortOrder: 0,
    ...overrides,
  } as TaskModel;
}

describe('useReAddModalStore', () => {
  beforeEach(() => {
    useReAddModalStore.setState({ open: false, task: null, initialDate: null });
  });

  it('has correct initial state', () => {
    const state = useReAddModalStore.getState();
    expect(state.open).toBe(false);
    expect(state.task).toBeNull();
    expect(state.initialDate).toBeNull();
  });

  it('openWithTask sets open, task, and initialDate', () => {
    const task = makeMockTask({ id: 'task-1' });
    const date = new Date('2026-03-09');

    useReAddModalStore.getState().openWithTask(task, date);

    const state = useReAddModalStore.getState();
    expect(state.open).toBe(true);
    expect(state.task).toEqual(task);
    expect(state.initialDate).toEqual(date);
  });

  it('openWithTask accepts null initialDate', () => {
    const task = makeMockTask({ id: 'task-1' });

    useReAddModalStore.getState().openWithTask(task, null);

    const state = useReAddModalStore.getState();
    expect(state.open).toBe(true);
    expect(state.task).toEqual(task);
    expect(state.initialDate).toBeNull();
  });

  it('close resets all state', () => {
    const task = makeMockTask({ id: 'task-1' });
    useReAddModalStore.getState().openWithTask(task, new Date());

    useReAddModalStore.getState().close();

    const state = useReAddModalStore.getState();
    expect(state.open).toBe(false);
    expect(state.task).toBeNull();
    expect(state.initialDate).toBeNull();
  });

  it('openWithTask replaces previous task', () => {
    const task1 = makeMockTask({ id: 'task-1' });
    const task2 = makeMockTask({ id: 'task-2' });

    useReAddModalStore.getState().openWithTask(task1, null);
    useReAddModalStore.getState().openWithTask(task2, new Date('2026-01-01'));

    const state = useReAddModalStore.getState();
    expect(state.task!.id).toBe('task-2');
    expect(state.initialDate).toEqual(new Date('2026-01-01'));
  });
});
