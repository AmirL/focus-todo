import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SelectTaskCategory } from './SelectTaskCategory';

vi.mock('@/shared/api/lists', () => ({
  useListsQuery: () => ({
    data: [
      { id: '1', name: 'Work' },
      { id: '2', name: 'Personal' },
    ],
    isLoading: false,
  }),
}));

describe('SelectTaskCategory', () => {
  it('renders with data-cy attribute', () => {
    render(<SelectTaskCategory selectedListId={1} setSelectedListId={vi.fn()} />);
    expect(document.querySelector('[data-cy="category-selector"]')).toBeInTheDocument();
  });

  it('displays the selected list name', () => {
    render(<SelectTaskCategory selectedListId={1} setSelectedListId={vi.fn()} />);
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('auto-selects first list when no selection exists', () => {
    const setSelectedListId = vi.fn();
    render(<SelectTaskCategory selectedListId={null} setSelectedListId={setSelectedListId} />);
    // Effect should fire and select the first list
    expect(setSelectedListId).toHaveBeenCalledWith(1);
  });
});
