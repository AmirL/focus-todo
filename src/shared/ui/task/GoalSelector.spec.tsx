import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GoalSelector } from './GoalSelector';
import type { TaskMetadata } from './useTaskMetadata';

vi.mock('@/shared/api/goals', () => ({
  useGoalsQuery: () => ({
    data: [
      { id: 1, title: 'Goal A' },
      { id: 2, title: 'Goal B' },
    ],
    isLoading: false,
  }),
}));

const defaultMetadata: TaskMetadata = {
  selectedDuration: null,
  selectedListId: null,
  isStarred: false,
  isBlocker: false,
  selectedDate: null,
  selectedGoalId: null,
};

describe('GoalSelector', () => {
  it('renders with data-cy attribute', () => {
    render(<GoalSelector metadata={defaultMetadata} onMetadataChange={vi.fn()} />);
    expect(document.querySelector('[data-cy="goal-selector"]')).toBeInTheDocument();
  });

  it('shows selected goal value', () => {
    render(<GoalSelector metadata={{ ...defaultMetadata, selectedGoalId: 1 }} onMetadataChange={vi.fn()} />);
    expect(screen.getByText('Goal A')).toBeInTheDocument();
  });

  it('shows "No goal" when no selection', () => {
    render(<GoalSelector metadata={defaultMetadata} onMetadataChange={vi.fn()} />);
    expect(screen.getByText('No goal')).toBeInTheDocument();
  });
});
