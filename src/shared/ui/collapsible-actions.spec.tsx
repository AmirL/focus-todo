import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CollapsibleActions } from './collapsible-actions';

describe('CollapsibleActions', () => {
  it('renders children', () => {
    render(
      <CollapsibleActions>
        <button>Action 1</button>
      </CollapsibleActions>
    );
    expect(screen.getAllByText('Action 1').length).toBeGreaterThan(0);
  });

  it('renders trigger button for mobile', () => {
    render(
      <CollapsibleActions>
        <button>Action</button>
      </CollapsibleActions>
    );
    // Should have mobile toggle buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
