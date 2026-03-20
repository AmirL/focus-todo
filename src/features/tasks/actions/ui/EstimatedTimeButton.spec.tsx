import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EstimatedTimeButton } from './EstimatedTimeButton';
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

describe('EstimatedTimeButton', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('renders with correct data-cy', () => {
    const task = makeTask({ id: 'task-10' });
    render(<EstimatedTimeButton task={task} />);
    const trigger = screen.getByText('Set time');
    expect(trigger.closest('button')?.getAttribute('data-cy')).toBe('estimated-time-task-task-10');
  });

  it('shows "Set time" when no duration is set', () => {
    const task = makeTask({ estimatedDuration: null });
    render(<EstimatedTimeButton task={task} />);
    expect(screen.getByText('Set time')).toBeDefined();
  });

  it('shows formatted duration when set', () => {
    const task = makeTask({ estimatedDuration: 90 });
    render(<EstimatedTimeButton task={task} />);
    expect(screen.getByText('1.5h')).toBeDefined();
  });

  it('shows short duration format', () => {
    const task = makeTask({ estimatedDuration: 15 });
    render(<EstimatedTimeButton task={task} />);
    expect(screen.getByText('15m')).toBeDefined();
  });
});
