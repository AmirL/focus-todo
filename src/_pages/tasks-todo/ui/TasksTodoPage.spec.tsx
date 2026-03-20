import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TasksTodoPage } from './TasksTodoPage';

const mockInitializeFromURL = vi.fn();

vi.mock('@/features/tasks/filter', () => ({
  useFilterStore: () => ({ initializeFromURL: mockInitializeFromURL }),
}));

vi.mock('@/shared/ui/card', () => ({
  Card: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
}));

vi.mock('./TodoList', () => ({
  TodoList: () => <div data-testid="todo-list">TodoList</div>,
}));

describe('TasksTodoPage', () => {
  it('renders TodoList and initializes filter from URL', () => {
    render(<TasksTodoPage />);

    expect(screen.getByTestId('todo-list')).toBeDefined();
    expect(mockInitializeFromURL).toHaveBeenCalled();
  });
});
