import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StartTimerButton } from './StartTimerButton';

describe('StartTimerButton', () => {
  it('renders play icon when not running', () => {
    render(<StartTimerButton />);
    const btn = screen.getByRole('button');
    expect(btn).toHaveAttribute('aria-label', 'Start timer');
    expect(btn).toHaveAttribute('data-cy', 'start-timer-button');
  });

  it('renders pause icon when running', () => {
    render(<StartTimerButton isRunning />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Pause timer');
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<StartTimerButton onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<StartTimerButton disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<StartTimerButton className="custom-class" />);
    expect(screen.getByRole('button').className).toContain('custom-class');
  });
});
