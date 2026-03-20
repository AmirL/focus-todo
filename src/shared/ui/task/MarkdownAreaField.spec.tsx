import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownAreaField } from './MarkdownAreaField';

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown-content">{children}</div>,
}));

vi.mock('remark-gfm', () => ({
  default: () => {},
}));

describe('MarkdownAreaField', () => {
  const defaultProps = {
    label: 'Details',
    id: 'details',
    value: 'Some **markdown** content',
  };

  it('renders with view and edit tabs', () => {
    render(<MarkdownAreaField {...defaultProps} />);
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('renders markdown content in view tab', () => {
    render(<MarkdownAreaField {...defaultProps} />);
    expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
  });

  it('renders the data-md-view container', () => {
    render(<MarkdownAreaField {...defaultProps} />);
    expect(document.querySelector('[data-md-view]')).toBeInTheDocument();
  });

  it('renders label', () => {
    render(<MarkdownAreaField {...defaultProps} />);
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('renders tab list with correct roles', () => {
    render(<MarkdownAreaField {...defaultProps} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
  });
});
