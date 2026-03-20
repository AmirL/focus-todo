import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddTaskForm } from './AddTaskForm';

const mockMutate = vi.fn();
vi.mock('@/shared/api/tasks', () => ({
  useCreateTaskMutation: (opts: Record<string, unknown>) => ({
    mutate: (...args: unknown[]) => {
      mockMutate(...args);
      if (typeof opts?.onSuccess === 'function') {
        (opts.onSuccess as (t: { name: string }) => void)({ name: 'Test' });
      }
    },
  }),
}));

vi.mock('@/features/tasks/edit', () => ({
  useEditTaskModalStore: { getState: () => ({ openWithTask: vi.fn() }) },
}));

vi.mock('@/features/tasks/filter', () => ({
  StatusFilterEnum: { ALL: 'all', TODAY: 'today', TOMORROW: 'tomorrow', SELECTED: 'selected' },
  useFilterStore: () => ({ statusFilter: 'all', listId: null }),
}));

vi.mock('@/shared/ui/task/TaskFormFields', () => ({
  TaskFormFields: () => <div data-testid="task-form-fields" />,
}));

vi.mock('@/shared/ui/task/useTaskMetadata', () => ({
  useTaskMetadata: () => ({
    metadata: {
      selectedDuration: null,
      selectedListId: 1,
      isStarred: false,
      isBlocker: false,
      selectedDate: null,
      selectedGoalId: null,
    },
    updateMetadata: vi.fn(),
    resetMetadata: vi.fn(),
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), dismiss: vi.fn() },
}));

describe('AddTaskForm', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('renders the add task button with correct data-cy', () => {
    render(<AddTaskForm />);
    const btn = screen.getByRole('button');
    expect(btn.getAttribute('data-cy')).toBe('add-task-button');
  });

  it('opens dialog when button is clicked', () => {
    render(<AddTaskForm />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Add New Task')).toBeDefined();
  });

  it('shows Add Task button disabled when name is empty', () => {
    render(<AddTaskForm />);
    fireEvent.click(screen.getByRole('button'));
    const addBtn = screen.getByText('Add Task').closest('button');
    expect(addBtn?.disabled).toBe(true);
  });

  it('shows cancel button in dialog', () => {
    render(<AddTaskForm />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Cancel')).toBeDefined();
  });

  it('renders task form fields in dialog', () => {
    render(<AddTaskForm />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('task-form-fields')).toBeDefined();
  });
});
