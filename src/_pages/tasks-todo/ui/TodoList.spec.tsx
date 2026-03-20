import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoList } from './TodoList';

// Mock useSession
const mockUseSession = vi.fn();
vi.mock('@/shared/lib/auth-client', () => ({
  useSession: () => mockUseSession(),
}));

// Mock useFilterStore
vi.mock('@/features/tasks/filter', () => ({
  useFilterStore: () => ({ statusFilter: 'today' }),
  StatusFilterEnum: { TODAY: 'today', SELECTED: 'selected', TOMORROW: 'tomorrow' },
}));

// Mock all child components to isolate TodoList logic
vi.mock('@/features/tasks/add', () => ({
  AddTaskForm: () => <div data-testid="add-task-form">AddTaskForm</div>,
}));

vi.mock('./Goals', () => ({
  Goals: () => <div data-testid="goals">Goals</div>,
}));

vi.mock('./Tasks', () => ({
  Tasks: () => <div data-testid="tasks">Tasks</div>,
}));

vi.mock('./TaskActions', () => ({
  TaskActions: () => <div data-testid="task-actions">TaskActions</div>,
}));

vi.mock('./LastSelectedTaskHeader', () => ({
  LastSelectedTaskHeader: () => null,
}));

vi.mock('../api/useTasksLoader', () => ({
  useTasksLoader: () => ({ allTasks: [] }),
}));

vi.mock('@/features/tasks/edit', () => ({
  EditTaskModalRoot: () => null,
}));

vi.mock('@/features/tasks/search', () => ({
  Spotlight: () => null,
}));

vi.mock('@/features/tasks/actions', () => ({
  ReAddModalRoot: () => null,
}));

vi.mock('@/features/current-initiative/pick', () => ({
  InitiativePicker: () => null,
}));

vi.mock('@/features/current-initiative/banner', () => ({
  TodayFocusBanner: () => null,
}));

vi.mock('@/features/timer', () => ({
  ActiveTimerBar: () => null,
  useTimerSync: () => {},
}));

vi.mock('@/features/timeline', () => ({
  TodayTimeline: () => <div data-testid="today-timeline">TodayTimeline</div>,
}));

describe('TodoList', () => {
  it('shows loading state when session is pending', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: true });

    render(<TodoList />);

    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('shows unauthenticated state when no session', () => {
    mockUseSession.mockReturnValue({ data: null, isPending: false });

    render(<TodoList />);

    expect(screen.getByText('Please login to see your tasks.')).toBeDefined();
  });

  it('renders content when authenticated', () => {
    mockUseSession.mockReturnValue({ data: { user: { id: '1' } }, isPending: false });

    render(<TodoList />);

    expect(screen.getByTestId('goals')).toBeDefined();
    expect(screen.getByTestId('tasks')).toBeDefined();
    expect(screen.getByTestId('add-task-form')).toBeDefined();
  });
});
