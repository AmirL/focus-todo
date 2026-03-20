import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskActions } from './TaskActions';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';

// Mock stores and hooks
const mockStatusFilter = vi.fn();
vi.mock('@/features/tasks/filter', () => ({
  useFilterStore: () => ({ statusFilter: mockStatusFilter() }),
  StatusFilterEnum: { TODAY: 'today', SELECTED: 'selected', TOMORROW: 'tomorrow', FUTURE: 'future' },
  useApplyFilters: (tasks: TaskModel[]) => tasks,
}));

const mockTasksData = vi.fn();
const mockUpdateMutation = vi.fn();
vi.mock('@/shared/api/tasks', () => ({
  useTasksQuery: () => ({ data: mockTasksData() }),
  useUpdateTaskMutation: () => ({ mutate: mockUpdateMutation }),
}));

vi.mock('../model/sortTasks', () => ({
  useSortedTasks: (tasks: TaskModel[]) => tasks,
}));

vi.mock('@/shared/ui/button', () => ({
  Button: ({ children, onClick, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/features/tasks/print', () => ({
  PrintButton: () => <button data-testid="print-button">Print</button>,
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

beforeEach(() => {
  vi.clearAllMocks();
  mockStatusFilter.mockReturnValue('today');
});

describe('TaskActions', () => {
  it('renders nothing when no tasks', () => {
    mockTasksData.mockReturnValue([]);

    const { container } = render(<TaskActions />);

    expect(container.querySelector('[data-testid="print-button"]')).toBeNull();
  });

  it('renders action buttons when tasks exist', () => {
    const tasks = [makeTask()];
    mockTasksData.mockReturnValue(tasks);

    render(<TaskActions />);

    expect(screen.getByTestId('print-button')).toBeDefined();
    expect(screen.getByText(/JSON/)).toBeDefined();
  });

  it('copies tasks as JSON on click', async () => {
    const tasks = [makeTask({ id: 'task-1', name: 'Task One' })];
    mockTasksData.mockReturnValue(tasks);

    // Mock clipboard
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: writeTextMock } });

    render(<TaskActions />);

    fireEvent.click(screen.getByText(/JSON/));

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalled();
    });
  });

  it('shows toast error when no tasks to copy (all deleted)', async () => {
    const toast = await import('react-hot-toast');
    const tasks = [makeTask({ deletedAt: new Date() })];
    mockTasksData.mockReturnValue(tasks);

    render(<TaskActions />);

    fireEvent.click(screen.getByText(/JSON/));

    expect(toast.default.error).toHaveBeenCalledWith('No tasks in the current view to copy');
  });

  it('handles clipboard write failure', async () => {
    const toast = await import('react-hot-toast');
    const tasks = [makeTask()];
    mockTasksData.mockReturnValue(tasks);

    // Mock clipboard failure
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } });

    render(<TaskActions />);

    fireEvent.click(screen.getByText(/JSON/));

    await waitFor(() => {
      expect(toast.default.error).toHaveBeenCalled();
    });
  });

  it('shows reset button in selected filter with selected tasks', () => {
    mockStatusFilter.mockReturnValue('selected');
    const tasks = [makeTask({ selectedAt: new Date(), completedAt: null })];
    mockTasksData.mockReturnValue(tasks);

    render(<TaskActions />);

    expect(screen.getByText('Reset All Selected Tasks')).toBeDefined();
  });

  it('resets selected tasks on click', () => {
    mockStatusFilter.mockReturnValue('selected');
    const tasks = [
      makeTask({ id: 'task-1', selectedAt: new Date(), completedAt: null }),
      makeTask({ id: 'task-2', selectedAt: new Date(), completedAt: null }),
    ];
    mockTasksData.mockReturnValue(tasks);

    render(<TaskActions />);

    fireEvent.click(screen.getByText('Reset All Selected Tasks'));

    expect(mockUpdateMutation).toHaveBeenCalledTimes(2);
  });

  it('does not show reset button when not in selected filter', () => {
    mockStatusFilter.mockReturnValue('today');
    const tasks = [makeTask({ selectedAt: new Date() })];
    mockTasksData.mockReturnValue(tasks);

    render(<TaskActions />);

    expect(screen.queryByText('Reset All Selected Tasks')).toBeNull();
  });
});
