import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

describe('Select', () => {
  it('renders trigger with placeholder', () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('trigger')).toBeInTheDocument();
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('renders trigger with custom className', () => {
    render(
      <Select>
        <SelectTrigger className="my-select" data-testid="trigger">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('trigger')).toHaveClass('my-select');
  });

  it('renders with a selected value', () => {
    render(
      <Select value="opt1">
        <SelectTrigger data-testid="trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opt1">Option 1</SelectItem>
          <SelectItem value="opt2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('opens content on trigger click and shows items', () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Pick" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
          <SelectItem value="b">Beta</SelectItem>
        </SelectContent>
      </Select>
    );
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});
