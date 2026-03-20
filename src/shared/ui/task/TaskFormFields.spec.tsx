import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskFormFields } from './TaskFormFields';
import type { TaskMetadata } from './useTaskMetadata';

// Mock child components
vi.mock('./TaskMetadataFields', () => ({
  TaskMetadataFields: ({ metadata, onMetadataChange }: { metadata: TaskMetadata; onMetadataChange: (u: Partial<TaskMetadata>) => void }) => (
    <div data-testid="task-metadata-fields" />
  ),
}));

vi.mock('./MarkdownAreaField', () => ({
  MarkdownAreaField: ({ label, id, value, onChange }: { label: string; id: string; value: string; onChange?: (v: string) => void }) => (
    <textarea data-testid="markdown-area" value={value} onChange={(e) => onChange?.(e.target.value)} />
  ),
}));

vi.mock('./AiSuggestionBanner', () => ({
  AiSuggestionBanner: ({ fieldName, onAccept, onReject }: { fieldName: string; suggestion: string; onAccept: () => void; onReject: () => void }) => (
    <div data-testid={`ai-banner-${fieldName}`}>
      <button data-testid={`accept-${fieldName}`} onClick={onAccept}>Accept</button>
      <button data-testid={`reject-${fieldName}`} onClick={onReject}>Reject</button>
    </div>
  ),
}));

vi.mock('@/shared/lib/aiSuggestions', () => ({
  getPendingSuggestion: vi.fn().mockReturnValue(null),
}));

const defaultMetadata: TaskMetadata = {
  selectedDuration: null,
  selectedListId: null,
  isStarred: false,
  isBlocker: false,
  selectedDate: null,
  selectedGoalId: null,
};

describe('TaskFormFields', () => {
  const defaultProps = {
    name: 'Test Task',
    onNameChange: vi.fn(),
    details: 'Some details',
    onDetailsChange: vi.fn(),
    metadata: defaultMetadata,
    onMetadataChange: vi.fn(),
  };

  it('renders name input with value', () => {
    render(<TaskFormFields {...defaultProps} />);
    const input = screen.getByDisplayValue('Test Task');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('data-cy', 'task-name-input');
  });

  it('calls onNameChange when name input changes', () => {
    const onNameChange = vi.fn();
    render(<TaskFormFields {...defaultProps} onNameChange={onNameChange} />);
    const input = screen.getByDisplayValue('Test Task');
    fireEvent.change(input, { target: { value: 'New Name' } });
    expect(onNameChange).toHaveBeenCalledWith('New Name');
  });

  it('renders metadata fields', () => {
    render(<TaskFormFields {...defaultProps} />);
    expect(screen.getByTestId('task-metadata-fields')).toBeInTheDocument();
  });

  it('renders details area', () => {
    render(<TaskFormFields {...defaultProps} />);
    expect(screen.getByTestId('markdown-area')).toBeInTheDocument();
  });

  it('calls onDetailsChange when details change', () => {
    const onDetailsChange = vi.fn();
    render(<TaskFormFields {...defaultProps} onDetailsChange={onDetailsChange} />);
    const textarea = screen.getByTestId('markdown-area');
    fireEvent.change(textarea, { target: { value: 'New details' } });
    expect(onDetailsChange).toHaveBeenCalledWith('New details');
  });

  it('does not render AI banners when no suggestions', () => {
    render(<TaskFormFields {...defaultProps} />);
    expect(screen.queryByTestId('ai-banner-name')).not.toBeInTheDocument();
  });

  it('renders AI banners when suggestions exist', async () => {
    const { getPendingSuggestion } = await import('@/shared/lib/aiSuggestions');
    (getPendingSuggestion as ReturnType<typeof vi.fn>).mockReturnValue('Suggested value');

    render(
      <TaskFormFields
        {...defaultProps}
        aiSuggestions={{ name: { value: 'Suggested', status: 'pending' } } as never}
        onAcceptSuggestion={vi.fn()}
        onRejectSuggestion={vi.fn()}
      />
    );

    expect(screen.getByTestId('ai-banner-name')).toBeInTheDocument();

    // Reset mock
    (getPendingSuggestion as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  it('renders name label', () => {
    render(<TaskFormFields {...defaultProps} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders details label', () => {
    render(<TaskFormFields {...defaultProps} />);
    expect(screen.getByText('Details')).toBeInTheDocument();
  });
});
