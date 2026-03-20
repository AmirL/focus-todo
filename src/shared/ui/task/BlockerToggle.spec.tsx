import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlockerToggle } from './BlockerToggle';
import type { TaskMetadata } from './useTaskMetadata';

const defaultMetadata: TaskMetadata = {
  selectedDuration: null,
  selectedListId: null,
  isStarred: false,
  isBlocker: false,
  selectedDate: null,
  selectedGoalId: null,
};

describe('BlockerToggle', () => {
  it('renders with data-cy attribute', () => {
    render(<BlockerToggle metadata={defaultMetadata} onMetadataChange={vi.fn()} />);
    expect(document.querySelector('[data-cy="blocker-toggle"]')).toBeInTheDocument();
  });

  it('calls onMetadataChange with isBlocker true when clicked', () => {
    const onMetadataChange = vi.fn();
    render(<BlockerToggle metadata={defaultMetadata} onMetadataChange={onMetadataChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onMetadataChange).toHaveBeenCalledWith({ isBlocker: true });
  });

  it('calls onMetadataChange with isBlocker false when already checked', () => {
    const onMetadataChange = vi.fn();
    const metadata = { ...defaultMetadata, isBlocker: true };
    render(<BlockerToggle metadata={metadata} onMetadataChange={onMetadataChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onMetadataChange).toHaveBeenCalledWith({ isBlocker: false });
  });
});
