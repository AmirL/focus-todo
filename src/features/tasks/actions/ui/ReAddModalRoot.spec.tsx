import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReAddModalRoot } from './ReAddModalRoot';
import { useReAddModalStore } from '../model/reAddModalStore';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';

// Mock only the API boundary
vi.mock('@/shared/api/tasks', () => ({
  useCreateTaskMutation: () => ({ mutate: vi.fn() }),
  useUpdateTaskMutation: () => ({ mutate: vi.fn() }),
}));

// Mock shared UI components (these are shared/ui layer, not internal feature modules)
vi.mock('@/shared/ui/task/TaskFormFields', () => ({
  TaskFormFields: () => <div data-testid="task-form-fields" />,
}));

vi.mock('@/shared/ui/task/useTaskMetadata', () => ({
  useTaskMetadata: (initial: Record<string, unknown>) => ({
    metadata: {
      selectedDuration: null,
      selectedListId: 1,
      isStarred: false,
      isBlocker: false,
      selectedDate: null,
      selectedGoalId: null,
      ...initial,
    },
    updateMetadata: vi.fn(),
    resetMetadata: vi.fn(),
  }),
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

describe('ReAddModalRoot', () => {
  beforeEach(() => {
    useReAddModalStore.setState({ open: false, task: null, initialDate: null });
  });

  it('renders nothing when no task is set', () => {
    const { container } = render(<ReAddModalRoot />);
    expect(container.innerHTML).toBe('');
  });

  it('renders dialog when store has a task and is open', () => {
    const task = makeTask({ name: 'Re-add me' });
    useReAddModalStore.setState({ open: true, task, initialDate: null });
    render(<ReAddModalRoot />);
    expect(screen.getByText('Re-add Task')).toBeDefined();
  });
});
