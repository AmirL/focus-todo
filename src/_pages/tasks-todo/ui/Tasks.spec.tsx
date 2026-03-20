import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tasks } from './Tasks';
import { TaskModel } from '@/entities/task/model/task';
import { createInstance } from '@/shared/lib/instance-tools';

// Mock stores and hooks
const mockTasksLoader = vi.fn();
vi.mock('../api/useTasksLoader', () => ({
  useTasksLoader: () => mockTasksLoader(),
}));

vi.mock('@/features/tasks/filter', () => ({
  useFilterStore: () => ({ statusFilter: 'today', listId: null }),
  StatusFilterEnum: { TODAY: 'today', SELECTED: 'selected', TOMORROW: 'tomorrow' },
  useApplyFilters: (tasks: TaskModel[]) => tasks,
}));

vi.mock('@/features/tasks/reorder', () => ({
  useReorderStore: () => ({
    setOptimisticTasks: vi.fn(),
    setIsDragging: vi.fn(),
    optimisticTasks: null,
    isDragging: false,
  }),
  useReorderMutation: () => ({ mutate: vi.fn() }),
}));

vi.mock('@/features/tasks/temp-select', () => ({
  useTempSelectStore: () => ({ clearSelections: vi.fn() }),
}));

vi.mock('@/shared/api/current-initiative', () => ({
  useCurrentInitiativeQuery: () => ({ data: null }),
}));

vi.mock('../model/sortTasks', () => ({
  useSortedTasks: (tasks: TaskModel[]) => tasks,
}));

vi.mock('../model/groupTasks', () => ({
  useGroupedTasksByList: (tasks: TaskModel[]) => {
    if (tasks.length === 0) return [];
    return [{
      id: 1,
      name: 'Work',
      tasks,
    }];
  },
}));

vi.mock('./TaskWithActions', () => ({
  TaskWithActions: ({ task }: { task: TaskModel }) => (
    <li data-testid={`task-${task.id}`}>{task.name}</li>
  ),
}));

vi.mock('./ErrorState', () => ({
  ErrorState: ({ title }: { title: string }) => <div data-testid="error">{title}</div>,
}));

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PointerSensor: class {},
  TouchSensor: class {},
  useSensor: () => ({}),
  useSensors: () => [],
  closestCenter: () => null,
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: {},
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
});

describe('Tasks', () => {
  it('shows error state when there is an error', () => {
    mockTasksLoader.mockReturnValue({
      allTasks: [],
      isLoading: false,
      error: new Error('Failed'),
    });

    render(<Tasks />);

    expect(screen.getByTestId('error')).toBeDefined();
    expect(screen.getByText('Error loading tasks')).toBeDefined();
  });

  it('shows loading state when loading with no tasks', () => {
    mockTasksLoader.mockReturnValue({
      allTasks: [],
      isLoading: true,
      error: null,
    });

    render(<Tasks />);

    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('shows empty state when no tasks after filtering', () => {
    mockTasksLoader.mockReturnValue({
      allTasks: [],
      isLoading: false,
      error: null,
    });

    render(<Tasks />);

    expect(screen.getByText('No tasks found.')).toBeDefined();
  });

  it('renders task groups with tasks', () => {
    const tasks = [
      makeTask({ id: 'task-1', name: 'Task One' }),
      makeTask({ id: 'task-2', name: 'Task Two' }),
    ];

    mockTasksLoader.mockReturnValue({
      allTasks: tasks,
      isLoading: false,
      error: null,
    });

    render(<Tasks />);

    expect(screen.getByText('Work')).toBeDefined();
    expect(screen.getByTestId('task-task-1')).toBeDefined();
    expect(screen.getByTestId('task-task-2')).toBeDefined();
  });

  it('does not show loading when loading but tasks already exist', () => {
    const tasks = [makeTask()];

    mockTasksLoader.mockReturnValue({
      allTasks: tasks,
      isLoading: true,
      error: null,
    });

    render(<Tasks />);

    expect(screen.queryByText('Loading...')).toBeNull();
    expect(screen.getByTestId('task-task-1')).toBeDefined();
  });
});
