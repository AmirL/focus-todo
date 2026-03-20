import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarredToggle } from './StarredToggle';
import type { TaskMetadata } from './useTaskMetadata';

const defaultMetadata: TaskMetadata = {
  selectedDuration: null,
  selectedListId: null,
  isStarred: false,
  isBlocker: false,
  selectedDate: null,
  selectedGoalId: null,
};

describe('StarredToggle', () => {
  it('renders with data-cy attribute', () => {
    render(<StarredToggle metadata={defaultMetadata} onMetadataChange={vi.fn()} />);
    expect(document.querySelector('[data-cy="starred-toggle"]')).toBeInTheDocument();
  });

  it('calls onMetadataChange with isStarred true when clicked', () => {
    const onMetadataChange = vi.fn();
    render(<StarredToggle metadata={defaultMetadata} onMetadataChange={onMetadataChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onMetadataChange).toHaveBeenCalledWith({ isStarred: true });
  });

  it('calls onMetadataChange with isStarred false when already checked', () => {
    const onMetadataChange = vi.fn();
    const metadata = { ...defaultMetadata, isStarred: true };
    render(<StarredToggle metadata={metadata} onMetadataChange={onMetadataChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onMetadataChange).toHaveBeenCalledWith({ isStarred: false });
  });
});
