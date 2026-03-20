import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarButton } from './StarButton';
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

describe('StarButton', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('renders with correct data-cy', () => {
    const task = makeTask({ id: 'task-7' });
    render(<StarButton task={task} />);
    expect(screen.getByRole('button').getAttribute('data-cy')).toBe('star-task-task-7');
  });

  it('stars an unstarred task on click', () => {
    const task = makeTask({ selectedAt: null });
    render(<StarButton task={task} />);
    fireEvent.click(screen.getByRole('button'));
    const mutatedTask = mockMutate.mock.calls[0][0];
    expect(mutatedTask.selectedAt).toBeInstanceOf(Date);
  });

  it('unstars a starred task on click', () => {
    const task = makeTask({ selectedAt: new Date('2026-01-01') });
    render(<StarButton task={task} />);
    fireEvent.click(screen.getByRole('button'));
    const mutatedTask = mockMutate.mock.calls[0][0];
    expect(mutatedTask.selectedAt).toBeNull();
  });
});
