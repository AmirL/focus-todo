import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('renders title and error message for Error instances', () => {
    render(<ErrorState title="Error loading tasks" error={new Error('Network error')} />);

    expect(screen.getByText('Error loading tasks')).toBeDefined();
    expect(screen.getByText('Network error')).toBeDefined();
  });

  it('renders fallback message for non-Error objects', () => {
    render(<ErrorState title="Something went wrong" error="string error" />);

    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText('Unknown error occurred')).toBeDefined();
  });
});
