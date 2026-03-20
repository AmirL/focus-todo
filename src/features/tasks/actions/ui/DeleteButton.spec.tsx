import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteButton } from './DeleteButton';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';

const mockMutate = vi.fn();
vi.mock('@/shared/api/tasks', () => ({
  useUpdateTaskMutation: () => ({ mutate: mockMutate }),
}));

function makeTask(overrides: Partial<TaskModel> = {}): TaskModel {
  return createInstance(TaskModel, {
    id: 'task-1',
    name: 'Test Task',
    listId: 1,
    isBlocker: false,
    selectedAt: null,
    deletedAt: null,
    date: null,
    estimatedDuration: null,
    completedAt: null,
    sortOrder: 0,
    ...overrides,
  });
}

describe('DeleteButton', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('renders with correct data-cy', () => {
    const task = makeTask({ id: 'task-5' });
    render(<DeleteButton task={task} />);
    expect(screen.getByRole('button').getAttribute('data-cy')).toBe('delete-task-task-5');
  });

  it('soft-deletes a non-deleted task on click', () => {
    const task = makeTask({ deletedAt: null });
    render(<DeleteButton task={task} />);
    fireEvent.click(screen.getByRole('button'));
    const mutatedTask = mockMutate.mock.calls[0][0];
    expect(mutatedTask.deletedAt).toBeInstanceOf(Date);
  });

  it('undeletes a deleted task on click', () => {
    const task = makeTask({ deletedAt: new Date('2026-01-01') });
    render(<DeleteButton task={task} />);
    fireEvent.click(screen.getByRole('button'));
    const mutatedTask = mockMutate.mock.calls[0][0];
    expect(mutatedTask.deletedAt).toBeNull();
  });
});
