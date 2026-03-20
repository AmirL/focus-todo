import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AiSuggestionBanner } from './AiSuggestionBanner';

// Mock react-markdown since it uses ESM
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));

vi.mock('remark-gfm', () => ({
  default: () => {},
}));

describe('AiSuggestionBanner', () => {
  const defaultProps = {
    fieldName: 'name',
    suggestion: 'Suggested task name',
    onAccept: vi.fn(),
    onReject: vi.fn(),
  };

  it('renders with data-cy attribute', () => {
    render(<AiSuggestionBanner {...defaultProps} />);
    expect(document.querySelector('[data-cy="ai-suggestion-banner-name"]')).toBeInTheDocument();
  });

  it('renders suggestion text', () => {
    render(<AiSuggestionBanner {...defaultProps} />);
    expect(screen.getByText('Suggested task name')).toBeInTheDocument();
  });

  it('renders AI suggestion label', () => {
    render(<AiSuggestionBanner {...defaultProps} />);
    expect(screen.getByText('AI suggestion')).toBeInTheDocument();
  });

  it('calls onAccept when accept button is clicked', () => {
    const onAccept = vi.fn();
    render(<AiSuggestionBanner {...defaultProps} onAccept={onAccept} />);
    fireEvent.click(document.querySelector(`[data-cy="accept-suggestion-name"]`)!);
    expect(onAccept).toHaveBeenCalledOnce();
  });

  it('calls onReject when reject button is clicked', () => {
    const onReject = vi.fn();
    render(<AiSuggestionBanner {...defaultProps} onReject={onReject} />);
    fireEvent.click(document.querySelector(`[data-cy="reject-suggestion-name"]`)!);
    expect(onReject).toHaveBeenCalledOnce();
  });

  it('uses displayValue when provided', () => {
    render(<AiSuggestionBanner {...defaultProps} displayValue="30m" />);
    expect(screen.getByText('30m')).toBeInTheDocument();
  });

  it('truncates long text and shows more/less toggle', () => {
    const longText = 'A'.repeat(150);
    render(<AiSuggestionBanner {...defaultProps} suggestion={longText} />);
    expect(screen.getByText('more')).toBeInTheDocument();
    fireEvent.click(screen.getByText('more'));
    expect(screen.getByText('less')).toBeInTheDocument();
  });

  it('does not truncate short text', () => {
    render(<AiSuggestionBanner {...defaultProps} suggestion="Short" />);
    expect(screen.queryByText('more')).not.toBeInTheDocument();
  });

  it('renders as markdown when renderAsMarkdown is true', () => {
    render(<AiSuggestionBanner {...defaultProps} renderAsMarkdown />);
    expect(screen.getByTestId('markdown')).toBeInTheDocument();
  });
});
