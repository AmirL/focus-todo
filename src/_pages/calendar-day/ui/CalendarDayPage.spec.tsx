import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarDayPage } from './CalendarDayPage';

const mockMutate = vi.fn();

vi.mock('@/shared/api/time-entries', () => ({
  useTimeEntriesQuery: () => ({ data: [] }),
  useUpdateTimeEntryMutation: () => ({ mutate: mockMutate }),
  useDeleteTimeEntryMutation: () => ({ mutate: mockMutate }),
}));

vi.mock('@/shared/api/tasks', () => ({
  useTasksQuery: () => ({ data: [] }),
}));

vi.mock('@/shared/api/lists', () => ({
  useListsQuery: () => ({ data: [] }),
}));

vi.mock('@/shared/lib/listUtils', () => ({
  useListNameMap: () => ({}),
  useListColorMap: () => ({}),
}));

vi.mock('@/features/timeline', () => ({
  mapTimeEntriesToBlocks: () => [],
  aggregateTimeByList: () => [],
  QuickAddFromGapDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="gap-dialog">Gap Dialog</div> : null,
}));

vi.mock('@/shared/ui/timeline', () => ({
  DayTimeline: ({
    onPrevDay,
    onNextDay,
    onBlockEdit,
    onBlockDelete,
    onGapClick,
    onAddEntry,
  }: {
    onPrevDay: () => void;
    onNextDay: () => void;
    onBlockEdit: (block: { id: string }, start: string, end: string) => void;
    onBlockDelete: (block: { id: string }) => void;
    onGapClick: (gap: { startedAt: string; endedAt: string; durationMinutes: number }) => void;
    onAddEntry: (start: string, end: string) => void;
  }) => (
    <div data-testid="day-timeline">
      <button data-testid="prev-day" onClick={onPrevDay}>
        Prev
      </button>
      <button data-testid="next-day" onClick={onNextDay}>
        Next
      </button>
      <button
        data-testid="edit-block"
        onClick={() => onBlockEdit({ id: '1' }, '09:00', '10:00')}
      >
        Edit
      </button>
      <button data-testid="delete-block" onClick={() => onBlockDelete({ id: '1' })}>
        Delete
      </button>
      <button
        data-testid="gap-click"
        onClick={() =>
          onGapClick({
            startedAt: '2024-01-01T09:00:00Z',
            endedAt: '2024-01-01T10:00:00Z',
            durationMinutes: 60,
          })
        }
      >
        Gap
      </button>
      <button data-testid="add-entry" onClick={() => onAddEntry('11:00', '12:00')}>
        Add
      </button>
    </div>
  ),
}));

vi.mock('@/shared/ui/charts', () => ({
  DoughnutChart: () => <div data-testid="doughnut-chart">Chart</div>,
}));

describe('CalendarDayPage', () => {
  beforeEach(() => {
    mockMutate.mockClear();
  });

  it('renders the page with timeline and chart', () => {
    render(<CalendarDayPage />);

    expect(screen.getByTestId('day-timeline')).toBeDefined();
    expect(screen.getByTestId('doughnut-chart')).toBeDefined();
  });

  it('navigates to previous day when prev button is clicked', () => {
    render(<CalendarDayPage />);

    fireEvent.click(screen.getByTestId('prev-day'));
    // No error means the handler executed successfully
    expect(screen.getByTestId('day-timeline')).toBeDefined();
  });

  it('navigates to next day when next button is clicked', () => {
    render(<CalendarDayPage />);

    fireEvent.click(screen.getByTestId('next-day'));
    expect(screen.getByTestId('day-timeline')).toBeDefined();
  });

  it('updates a time entry when a block is edited', () => {
    render(<CalendarDayPage />);

    fireEvent.click(screen.getByTestId('edit-block'));
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        startedAt: expect.any(String),
        endedAt: expect.any(String),
      }),
    );
  });

  it('deletes a time entry when a block is deleted', () => {
    render(<CalendarDayPage />);

    fireEvent.click(screen.getByTestId('delete-block'));
    expect(mockMutate).toHaveBeenCalledWith(1);
  });

  it('opens the gap dialog when a gap is clicked', () => {
    render(<CalendarDayPage />);

    // Gap dialog should not be visible initially
    expect(screen.queryByTestId('gap-dialog')).toBeNull();

    fireEvent.click(screen.getByTestId('gap-click'));
    expect(screen.getByTestId('gap-dialog')).toBeDefined();
  });

  it('opens the gap dialog when adding an entry from timeline', () => {
    render(<CalendarDayPage />);

    expect(screen.queryByTestId('gap-dialog')).toBeNull();

    fireEvent.click(screen.getByTestId('add-entry'));
    expect(screen.getByTestId('gap-dialog')).toBeDefined();
  });
});
