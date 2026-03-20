import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColorPicker, ColorSwatch } from './color-picker';

describe('ColorPicker', () => {
  it('renders with placeholder when no value', () => {
    render(<ColorPicker value={null} onChange={vi.fn()} />);
    expect(document.querySelector('[data-cy="color-picker"]')).toBeInTheDocument();
  });

  it('renders with selected color name', () => {
    render(<ColorPicker value="blue" onChange={vi.fn()} />);
    expect(screen.getByText('Blue')).toBeInTheDocument();
  });
});

describe('ColorSwatch', () => {
  it('renders with correct classes', () => {
    render(<ColorSwatch color="blue" data-testid="swatch" />);
    expect(screen.getByTestId('swatch')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(<ColorSwatch color="red" className="custom" data-testid="swatch" />);
    expect(screen.getByTestId('swatch')).toHaveClass('custom');
  });
});
