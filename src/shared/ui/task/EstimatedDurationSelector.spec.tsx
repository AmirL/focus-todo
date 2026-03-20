import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EstimatedDurationSelector } from './EstimatedDurationSelector';

describe('EstimatedDurationSelector', () => {
  it('renders with data-cy attribute', () => {
    render(<EstimatedDurationSelector value={null} onChange={vi.fn()} />);
    expect(document.querySelector('[data-cy="duration-selector"]')).toBeInTheDocument();
  });

  it('shows placeholder when no value', () => {
    render(<EstimatedDurationSelector value={null} onChange={vi.fn()} />);
    expect(screen.getByText('Select duration')).toBeInTheDocument();
  });

  it('shows formatted duration when value set', () => {
    render(<EstimatedDurationSelector value={60} onChange={vi.fn()} />);
    expect(screen.getByText('1h')).toBeInTheDocument();
  });

  it('shows "Set time" when no value and label hidden', () => {
    render(<EstimatedDurationSelector value={null} onChange={vi.fn()} showLabel={false} />);
    expect(screen.getByText('Set time')).toBeInTheDocument();
  });

  it('shows label when showLabel is true', () => {
    render(<EstimatedDurationSelector value={null} onChange={vi.fn()} showLabel label="Duration" />);
    expect(screen.getByText('Duration')).toBeInTheDocument();
  });

  it('hides label when showLabel is false', () => {
    render(<EstimatedDurationSelector value={null} onChange={vi.fn()} showLabel={false} label="Duration" />);
    expect(screen.queryByText('Duration')).not.toBeInTheDocument();
  });

  it('opens popover on click and shows duration options', () => {
    render(<EstimatedDurationSelector value={null} onChange={vi.fn()} />);
    fireEvent.click(document.querySelector('[data-cy="duration-selector"]')!);
    // Should show the popover with None and duration options
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Estimated Duration')).toBeInTheDocument();
  });
});
