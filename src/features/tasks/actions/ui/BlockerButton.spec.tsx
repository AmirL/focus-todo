import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockerButton } from './BlockerButton';
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

describe('BlockerButton', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('renders a button with data-cy attribute', () => {
    const task = makeTask({ id: 'task-42' });
    render(<BlockerButton task={task} />);
    const button = screen.getByRole('button');
    expect(button).toBeDefined();
    expect(button.getAttribute('data-cy')).toBe('blocker-task-task-42');
  });

  it('calls mutation on click', () => {
    const task = makeTask({ isBlocker: false });
    render(<BlockerButton task={task} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockMutate).toHaveBeenCalledTimes(1);
    const mutatedTask = mockMutate.mock.calls[0][0];
    expect(mutatedTask.isBlocker).toBe(true);
  });

  it('toggles blocker off when already set', () => {
    const task = makeTask({ isBlocker: true });
    render(<BlockerButton task={task} />);
    fireEvent.click(screen.getByRole('button'));
    const mutatedTask = mockMutate.mock.calls[0][0];
    expect(mutatedTask.isBlocker).toBe(false);
  });
});
