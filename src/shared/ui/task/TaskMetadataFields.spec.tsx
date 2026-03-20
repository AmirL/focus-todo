import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskMetadataFields } from './TaskMetadataFields';
import type { TaskMetadata } from './useTaskMetadata';

// Mock all child selectors
vi.mock('./CategorySelector', () => ({
  CategorySelector: () => <div data-testid="category-selector" />,
}));
vi.mock('./GoalSelector', () => ({
  GoalSelector: () => <div data-testid="goal-selector" />,
}));
vi.mock('./DurationSelector', () => ({
  DurationSelector: () => <div data-testid="duration-selector" />,
}));
vi.mock('./BlockerToggle', () => ({
  BlockerToggle: () => <div data-testid="blocker-toggle" />,
}));
vi.mock('./StarredToggle', () => ({
  StarredToggle: () => <div data-testid="starred-toggle" />,
}));
vi.mock('./TaskDatePicker', () => ({
  TaskDatePicker: () => <div data-testid="task-date-picker" />,
}));

const defaultMetadata: TaskMetadata = {
  selectedDuration: null,
  selectedListId: null,
  isStarred: false,
  isBlocker: false,
  selectedDate: null,
  selectedGoalId: null,
};

describe('TaskMetadataFields', () => {
  it('renders all metadata field components', () => {
    render(<TaskMetadataFields metadata={defaultMetadata} onMetadataChange={vi.fn()} />);
    expect(screen.getByTestId('category-selector')).toBeInTheDocument();
    expect(screen.getByTestId('goal-selector')).toBeInTheDocument();
    expect(screen.getByTestId('duration-selector')).toBeInTheDocument();
    expect(screen.getByTestId('blocker-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('starred-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('task-date-picker')).toBeInTheDocument();
  });

  it('renders Category label', () => {
    render(<TaskMetadataFields metadata={defaultMetadata} onMetadataChange={vi.fn()} />);
    expect(screen.getByText('Category')).toBeInTheDocument();
  });
});
