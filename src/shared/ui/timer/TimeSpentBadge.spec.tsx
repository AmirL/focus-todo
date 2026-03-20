import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimeSpentBadge } from './TimeSpentBadge';

describe('TimeSpentBadge', () => {
  it('returns null when actualMinutes is 0', () => {
    const { container } = render(<TimeSpentBadge actualMinutes={0} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when actualMinutes is negative', () => {
    const { container } = render(<TimeSpentBadge actualMinutes={-5} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders formatted duration for positive minutes', () => {
    render(<TimeSpentBadge actualMinutes={90} />);
    const badge = document.querySelector('[data-cy="time-spent-badge"]');
    expect(badge).toBeInTheDocument();
    expect(badge?.textContent).toContain('1.5h');
  });

  it('shows estimated duration when provided', () => {
    render(<TimeSpentBadge actualMinutes={45} estimatedMinutes={60} />);
    expect(screen.getByText('45m')).toBeInTheDocument();
    expect(screen.getByText(/~1h/)).toBeInTheDocument();
  });

  it('applies red styling when over estimated time', () => {
    render(<TimeSpentBadge actualMinutes={90} estimatedMinutes={60} />);
    const badge = document.querySelector('[data-cy="time-spent-badge"]');
    expect(badge?.className).toContain('text-red-600');
  });

  it('applies blue styling when under estimated time', () => {
    render(<TimeSpentBadge actualMinutes={30} estimatedMinutes={60} />);
    const badge = document.querySelector('[data-cy="time-spent-badge"]');
    expect(badge?.className).toContain('text-blue-600');
  });

  it('applies blue styling when no estimate provided', () => {
    render(<TimeSpentBadge actualMinutes={30} />);
    const badge = document.querySelector('[data-cy="time-spent-badge"]');
    expect(badge?.className).toContain('text-blue-600');
  });

  it('handles null estimatedMinutes', () => {
    render(<TimeSpentBadge actualMinutes={30} estimatedMinutes={null} />);
    const badge = document.querySelector('[data-cy="time-spent-badge"]');
    expect(badge).toBeInTheDocument();
    expect(badge?.className).toContain('text-blue-600');
  });
});
