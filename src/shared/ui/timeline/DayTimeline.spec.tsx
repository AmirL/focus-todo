import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DayTimeline } from './DayTimeline';
import type { TimelineBlock } from './TimelineBar';

// Mock colors module
vi.mock('@/shared/lib/colors', () => ({
  getColorClasses: () => ({
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-800',
    hover: 'hover:bg-blue-200',
  }),
}));

function makeBlock(overrides: Partial<TimelineBlock> = {}): TimelineBlock {
  return {
    id: 'block-1',
    taskName: 'Test Task',
    startedAt: '2026-03-20T09:00:00',
    endedAt: '2026-03-20T10:00:00',
    listName: 'Work',
    listColor: 'blue',
    durationMinutes: 60,
    ...overrides,
  };
}

describe('DayTimeline', () => {
  const baseDate = new Date('2026-03-20');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-20T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with data-cy attribute', () => {
    render(<DayTimeline date={baseDate} blocks={[]} />);
    expect(document.querySelector('[data-cy="day-timeline"]')).toBeInTheDocument();
  });

  it('renders date header', () => {
    render(<DayTimeline date={baseDate} blocks={[]} />);
    expect(document.querySelector('[data-cy="day-timeline-header"]')).toBeInTheDocument();
    // Should display a formatted date
    expect(screen.getByText(/March/)).toBeInTheDocument();
  });

  it('renders empty state when no blocks', () => {
    render(<DayTimeline date={baseDate} blocks={[]} />);
    expect(screen.getByText('No time entries for this day')).toBeInTheDocument();
    expect(document.querySelector('[data-cy="day-timeline-empty"]')).toBeInTheDocument();
  });

  it('renders time blocks', () => {
    const blocks = [makeBlock()];
    render(<DayTimeline date={baseDate} blocks={blocks} />);
    const dayBlocks = document.querySelectorAll('[data-cy="day-timeline-block"]');
    expect(dayBlocks.length).toBe(1);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders multiple blocks', () => {
    const blocks = [
      makeBlock({ id: 'b1', startedAt: '2026-03-20T09:00:00', endedAt: '2026-03-20T10:00:00' }),
      makeBlock({ id: 'b2', taskName: 'Task 2', startedAt: '2026-03-20T11:00:00', endedAt: '2026-03-20T12:00:00' }),
    ];
    render(<DayTimeline date={baseDate} blocks={blocks} />);
    const dayBlocks = document.querySelectorAll('[data-cy="day-timeline-block"]');
    expect(dayBlocks.length).toBe(2);
  });

  it('calls onPrevDay when previous button is clicked', () => {
    const onPrevDay = vi.fn();
    render(<DayTimeline date={baseDate} blocks={[]} onPrevDay={onPrevDay} />);
    fireEvent.click(document.querySelector('[data-cy="day-timeline-prev"]')!);
    expect(onPrevDay).toHaveBeenCalledOnce();
  });

  it('calls onNextDay when next button is clicked', () => {
    const onNextDay = vi.fn();
    render(<DayTimeline date={baseDate} blocks={[]} onNextDay={onNextDay} />);
    fireEvent.click(document.querySelector('[data-cy="day-timeline-next"]')!);
    expect(onNextDay).toHaveBeenCalledOnce();
  });

  it('renders gaps between blocks', () => {
    const blocks = [
      makeBlock({ id: 'b1', startedAt: '2026-03-20T09:00:00', endedAt: '2026-03-20T10:00:00', durationMinutes: 60 }),
      makeBlock({ id: 'b2', taskName: 'Task 2', startedAt: '2026-03-20T11:00:00', endedAt: '2026-03-20T12:00:00', durationMinutes: 60 }),
    ];
    render(<DayTimeline date={baseDate} blocks={blocks} />);
    const gaps = document.querySelectorAll('[data-cy="day-timeline-gap"]');
    expect(gaps.length).toBe(1);
  });

  it('renders add entry buttons when onAddEntry is provided', () => {
    render(<DayTimeline date={baseDate} blocks={[]} onAddEntry={() => {}} />);
    const addButtons = document.querySelectorAll('[data-cy="day-timeline-add-entry"]');
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it('does not render add entry buttons when onAddEntry is not provided', () => {
    render(<DayTimeline date={baseDate} blocks={[]} />);
    const addButtons = document.querySelectorAll('[data-cy="day-timeline-add-entry"]');
    expect(addButtons.length).toBe(0);
  });

  it('calls onAddEntry with time range when add button is clicked', () => {
    const onAddEntry = vi.fn();
    render(<DayTimeline date={baseDate} blocks={[]} onAddEntry={onAddEntry} />);
    const addButtons = document.querySelectorAll('[data-cy="day-timeline-add-entry"]');
    fireEvent.click(addButtons[0]);
    expect(onAddEntry).toHaveBeenCalledWith(expect.stringMatching(/^\d{2}:00$/), expect.stringMatching(/^\d{2}:00$/));
  });

  it('calls onBlockEditClick when a block is clicked', () => {
    const onBlockEditClick = vi.fn();
    const blocks = [makeBlock()];
    render(<DayTimeline date={baseDate} blocks={blocks} onBlockEditClick={onBlockEditClick} />);
    fireEvent.click(document.querySelector('[data-cy="day-timeline-block"]')!);
    expect(onBlockEditClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'block-1' }));
  });

  it('calls onBlockEditClick when pencil edit button is clicked', () => {
    const onBlockEditClick = vi.fn();
    const blocks = [makeBlock()];
    render(<DayTimeline date={baseDate} blocks={blocks} onBlockEditClick={onBlockEditClick} />);
    const editBtn = document.querySelector('[data-cy="day-timeline-edit-btn"]');
    expect(editBtn).toBeInTheDocument();
    fireEvent.click(editBtn!);
    expect(onBlockEditClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'block-1' }));
  });

  it('does not render inline editor when block is clicked', () => {
    const blocks = [makeBlock()];
    render(<DayTimeline date={baseDate} blocks={blocks} onBlockEditClick={() => {}} />);
    fireEvent.click(document.querySelector('[data-cy="day-timeline-block"]')!);
    expect(document.querySelector('[data-cy="day-timeline-inline-editor"]')).not.toBeInTheDocument();
  });

  it('calls onBlockDelete when delete button is clicked', () => {
    const onBlockDelete = vi.fn();
    const blocks = [makeBlock()];
    render(<DayTimeline date={baseDate} blocks={blocks} onBlockDelete={onBlockDelete} />);
    const deleteBtn = document.querySelector('[data-cy="day-timeline-delete-btn"]');
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn!);
    expect(onBlockDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 'block-1' }));
  });

  it('applies custom className', () => {
    render(<DayTimeline date={baseDate} blocks={[]} className="custom" />);
    const timeline = document.querySelector('[data-cy="day-timeline"]');
    expect(timeline?.className).toContain('custom');
  });

  it('renders hour labels in the timeline grid', () => {
    render(<DayTimeline date={baseDate} blocks={[]} />);
    // Default range is 08:00 to 23:00
    expect(screen.getByText('08:00')).toBeInTheDocument();
  });

  it('handles overlapping blocks with column layout', () => {
    // Two blocks that overlap in time should be placed side by side
    const blocks = [
      makeBlock({ id: 'b1', taskName: 'Task A', startedAt: '2026-03-20T09:00:00', endedAt: '2026-03-20T10:30:00', durationMinutes: 90 }),
      makeBlock({ id: 'b2', taskName: 'Task B', startedAt: '2026-03-20T09:15:00', endedAt: '2026-03-20T10:00:00', durationMinutes: 45 }),
    ];
    render(<DayTimeline date={baseDate} blocks={blocks} />);
    const dayBlocks = document.querySelectorAll('[data-cy="day-timeline-block"]');
    expect(dayBlocks.length).toBe(2);
    // Overlapping blocks should have inline column styles set
    const block1Style = (dayBlocks[0] as HTMLElement).style;
    const block2Style = (dayBlocks[1] as HTMLElement).style;
    // At least one should have a left style from column positioning
    expect(block1Style.left || block2Style.left).toBeTruthy();
  });

  it('handles blocks extending beyond default hour range', () => {
    // Block that starts before 8am and ends after 11pm
    const blocks = [
      makeBlock({ id: 'b1', startedAt: '2026-03-20T06:30:00', endedAt: '2026-03-20T07:30:00', durationMinutes: 60 }),
    ];
    render(<DayTimeline date={baseDate} blocks={blocks} />);
    // Hour range should expand to include 6am
    expect(screen.getByText('06:00')).toBeInTheDocument();
  });

  it('handles running block (endedAt is null)', () => {
    const blocks = [
      makeBlock({ id: 'b1', endedAt: null, durationMinutes: null }),
    ];
    render(<DayTimeline date={baseDate} blocks={blocks} />);
    const dayBlocks = document.querySelectorAll('[data-cy="day-timeline-block"]');
    expect(dayBlocks.length).toBe(1);
    // Running block should have animate-pulse
    expect((dayBlocks[0] as HTMLElement).className).toContain('animate-pulse');
  });

  it('calls onGapClick when gap is clicked', () => {
    const onGapClick = vi.fn();
    const blocks = [
      makeBlock({ id: 'b1', startedAt: '2026-03-20T09:00:00', endedAt: '2026-03-20T10:00:00', durationMinutes: 60 }),
      makeBlock({ id: 'b2', startedAt: '2026-03-20T11:00:00', endedAt: '2026-03-20T12:00:00', durationMinutes: 60 }),
    ];
    render(<DayTimeline date={baseDate} blocks={blocks} onGapClick={onGapClick} />);
    const gaps = document.querySelectorAll('[data-cy="day-timeline-gap"]');
    expect(gaps.length).toBe(1);
    fireEvent.click(gaps[0]);
    expect(onGapClick).toHaveBeenCalledWith(expect.objectContaining({
      durationMinutes: expect.any(Number),
    }));
  });

  it('handles three overlapping blocks in columns', () => {
    const blocks = [
      makeBlock({ id: 'b1', taskName: 'A', startedAt: '2026-03-20T09:00:00', endedAt: '2026-03-20T10:30:00', durationMinutes: 90 }),
      makeBlock({ id: 'b2', taskName: 'B', startedAt: '2026-03-20T09:10:00', endedAt: '2026-03-20T10:00:00', durationMinutes: 50 }),
      makeBlock({ id: 'b3', taskName: 'C', startedAt: '2026-03-20T09:20:00', endedAt: '2026-03-20T09:50:00', durationMinutes: 30 }),
    ];
    render(<DayTimeline date={baseDate} blocks={blocks} />);
    const dayBlocks = document.querySelectorAll('[data-cy="day-timeline-block"]');
    expect(dayBlocks.length).toBe(3);
  });

  it('handles block ending on a non-hour boundary (minutes > 0)', () => {
    const blocks = [
      makeBlock({ id: 'b1', startedAt: '2026-03-20T22:00:00', endedAt: '2026-03-20T23:30:00', durationMinutes: 90 }),
    ];
    render(<DayTimeline date={baseDate} blocks={blocks} />);
    // endHour should round up to 24 since minutes > 0
    const dayBlocks = document.querySelectorAll('[data-cy="day-timeline-block"]');
    expect(dayBlocks.length).toBe(1);
  });
});
