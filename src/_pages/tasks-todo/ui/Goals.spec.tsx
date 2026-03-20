import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Goals } from './Goals';

const mockUseGoalsLoader = vi.fn();

vi.mock('../api/useGoalsLoader', () => ({
  useGoalsLoader: () => mockUseGoalsLoader(),
}));

vi.mock('./Section', () => ({
  ContentSection: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <section>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  ),
}));

vi.mock('@/entities/goal', () => ({
  Goal: ({ goal }: { goal: { title: string }; actionButtons: React.ReactNode }) => (
    <div data-testid={`goal-${goal.title}`}>{goal.title}</div>
  ),
}));

vi.mock('@/features/goals/edit', () => ({
  EditGoalButton: () => <button>Edit</button>,
}));

vi.mock('@/features/goals/add', () => ({
  AddGoalDialog: () => <div data-testid="add-goal-dialog">Add Goal</div>,
}));

vi.mock('@/features/goals/actions', () => ({
  DeleteGoalButton: () => <button>Delete</button>,
}));

describe('Goals', () => {
  it('shows loading state', () => {
    mockUseGoalsLoader.mockReturnValue({ goals: [], isLoading: true, error: null });

    render(<Goals />);

    expect(screen.getByText('Loading...')).toBeDefined();
  });

  it('shows error state with Error instance', () => {
    mockUseGoalsLoader.mockReturnValue({ goals: [], isLoading: false, error: new Error('Failed') });

    render(<Goals />);

    expect(screen.getByText('Error loading goals')).toBeDefined();
    expect(screen.getByText('Failed')).toBeDefined();
  });

  it('shows error state with non-Error', () => {
    mockUseGoalsLoader.mockReturnValue({ goals: [], isLoading: false, error: 'something' });

    render(<Goals />);

    expect(screen.getByText('Unknown error occurred')).toBeDefined();
  });

  it('renders goals list with add dialog', () => {
    const goals = [
      { id: '1', title: 'Goal A' },
      { id: '2', title: 'Goal B' },
    ];
    mockUseGoalsLoader.mockReturnValue({ goals, isLoading: false, error: null });

    render(<Goals />);

    expect(screen.getByTestId('goal-Goal A')).toBeDefined();
    expect(screen.getByTestId('goal-Goal B')).toBeDefined();
    expect(screen.getByTestId('add-goal-dialog')).toBeDefined();
  });
});
