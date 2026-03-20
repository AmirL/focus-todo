import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IconButtonToggle } from './IconButtonToggle';

describe('IconButtonToggle', () => {
  const defaultProps = {
    icon: (isChecked: boolean) => <span data-testid="icon">{isChecked ? 'ON' : 'OFF'}</span>,
    tooltipContent: 'Toggle me',
    isChecked: false,
    onCheckedChange: vi.fn(),
  };

  it('renders the icon with unchecked state', () => {
    render(<IconButtonToggle {...defaultProps} />);
    expect(screen.getByText('OFF')).toBeInTheDocument();
  });

  it('renders the icon with checked state', () => {
    render(<IconButtonToggle {...defaultProps} isChecked />);
    expect(screen.getByText('ON')).toBeInTheDocument();
  });

  it('calls onCheckedChange with toggled value on click', () => {
    const onCheckedChange = vi.fn();
    render(<IconButtonToggle {...defaultProps} isChecked={false} onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('calls onCheckedChange with false when already checked', () => {
    const onCheckedChange = vi.fn();
    render(<IconButtonToggle {...defaultProps} isChecked onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('applies data-cy attribute', () => {
    render(<IconButtonToggle {...defaultProps} data-cy="my-toggle" />);
    expect(document.querySelector('[data-cy="my-toggle"]')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<IconButtonToggle {...defaultProps} className="custom-class" />);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('custom-class');
  });
});
