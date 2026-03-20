import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LastSelectedTaskHeader } from './LastSelectedTaskHeader';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';

const mockGetLastSelected = vi.fn();

vi.mock('@/features/tasks/temp-select', () => ({
  useTempSelectStore: () => ({ getLastSelected: mockGetLastSelected }),
}));

vi.mock('./TaskWithActions', () => ({
  TaskWithActions: ({ task }: { task: TaskModel }) => (
    <div data-testid="task-with-actions">{task.name}</div>
  ),
}));

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
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    estimatedDuration: null,
    isBlocker: false,
    sortOrder: 0,
    aiSuggestions: null,
    goalId: null,
    ...overrides,
  });
}

describe('LastSelectedTaskHeader', () => {
  it('returns null when no task is selected', () => {
    mockGetLastSelected.mockReturnValue(null);

    const { container } = render(<LastSelectedTaskHeader tasks={[]} />);

    expect(container.innerHTML).toBe('');
  });

  it('returns null when selected task not found in list', () => {
    mockGetLastSelected.mockReturnValue('nonexistent-id');

    const tasks = [makeTask({ id: 'task-1' })];
    const { container } = render(<LastSelectedTaskHeader tasks={tasks} />);

    expect(container.innerHTML).toBe('');
  });

  it('renders header with selected task', () => {
    mockGetLastSelected.mockReturnValue('task-1');

    const tasks = [makeTask({ id: 'task-1', name: 'Selected Task' })];
    render(<LastSelectedTaskHeader tasks={tasks} />);

    expect(screen.getByText('Last Selected for Comparison:')).toBeDefined();
    expect(screen.getByText('Selected Task')).toBeDefined();
  });
});
