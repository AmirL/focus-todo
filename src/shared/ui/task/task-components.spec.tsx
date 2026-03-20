import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategorySelector } from './CategorySelector';
import { DurationSelector } from './DurationSelector';
import { TaskDatePicker } from './TaskDatePicker';
import type { TaskMetadata } from './useTaskMetadata';

// Mock the underlying components that make API calls
vi.mock('./SelectTaskCategory', () => ({
  SelectTaskCategory: ({ selectedListId, setSelectedListId }: { selectedListId: number | null; setSelectedListId: (id: number) => void }) => (
    <select data-testid="select-category" value={selectedListId ?? ''} onChange={(e) => setSelectedListId(Number(e.target.value))}>
      <option value="1">Work</option>
      <option value="2">Personal</option>
    </select>
  ),
}));

vi.mock('./EstimatedDurationSelector', () => ({
  EstimatedDurationSelector: ({ value, onChange, showLabel }: { value: number | null; onChange: (v: number | null) => void; showLabel: boolean }) => (
    <button data-testid="duration-selector" onClick={() => onChange(30)}>
      {value ? `${value}m` : 'Set time'}
    </button>
  ),
}));

vi.mock('./DatePickerButton', () => ({
  DatePickerButton: ({ selectedDate, onDateChange }: { selectedDate: Date | null; onDateChange: (d: Date | null) => void }) => (
    <button data-testid="date-picker" onClick={() => onDateChange(new Date('2026-03-21'))}>
      {selectedDate ? 'Has date' : 'Set Date'}
    </button>
  ),
}));

const defaultMetadata: TaskMetadata = {
  selectedDuration: null,
  selectedListId: null,
  isStarred: false,
  isBlocker: false,
  selectedDate: null,
  selectedGoalId: null,
};

describe('CategorySelector', () => {
  it('renders and passes metadata to SelectTaskCategory', () => {
    render(<CategorySelector metadata={{ ...defaultMetadata, selectedListId: 1 }} onMetadataChange={vi.fn()} />);
    expect(screen.getByTestId('select-category')).toBeInTheDocument();
  });

  it('calls onMetadataChange when category changes', () => {
    const onChange = vi.fn();
    render(<CategorySelector metadata={defaultMetadata} onMetadataChange={onChange} />);
    fireEvent.change(screen.getByTestId('select-category'), { target: { value: '2' } });
    expect(onChange).toHaveBeenCalledWith({ selectedListId: 2 });
  });
});

describe('DurationSelector', () => {
  it('renders duration selector', () => {
    render(<DurationSelector metadata={defaultMetadata} onMetadataChange={vi.fn()} />);
    expect(screen.getByTestId('duration-selector')).toBeInTheDocument();
  });

  it('calls onMetadataChange when duration changes', () => {
    const onChange = vi.fn();
    render(<DurationSelector metadata={defaultMetadata} onMetadataChange={onChange} />);
    fireEvent.click(screen.getByTestId('duration-selector'));
    expect(onChange).toHaveBeenCalledWith({ selectedDuration: 30 });
  });
});

describe('TaskDatePicker', () => {
  it('renders date picker', () => {
    render(<TaskDatePicker metadata={defaultMetadata} onMetadataChange={vi.fn()} />);
    expect(screen.getByTestId('date-picker')).toBeInTheDocument();
  });

  it('calls onMetadataChange when date changes', () => {
    const onChange = vi.fn();
    render(<TaskDatePicker metadata={defaultMetadata} onMetadataChange={onChange} />);
    fireEvent.click(screen.getByTestId('date-picker'));
    expect(onChange).toHaveBeenCalledWith({ selectedDate: expect.any(Date) });
  });
});
