import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineBar, type TimelineBlock } from './TimelineBar';

// Mock colors module
vi.mock('@/shared/lib/colors', () => ({
  getColorClasses: (color?: string | null) => ({
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
    startedAt: '2026-03-20T09:00:00.000Z',
    endedAt: '2026-03-20T10:00:00.000Z',
    listName: 'Work',
    listColor: 'blue',
    durationMinutes: 60,
    ...overrides,
  };
}

describe('TimelineBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-20T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders empty state when no blocks', () => {
    render(<TimelineBar blocks={[]} />);
    expect(screen.getByText('No time entries for today')).toBeInTheDocument();
    expect(document.querySelector('[data-cy="timeline-bar"]')).toBeInTheDocument();
  });

  it('renders blocks', () => {
    const blocks = [makeBlock()];
    render(<TimelineBar blocks={blocks} />);
    const timelineBlocks = document.querySelectorAll('[data-cy="timeline-block"]');
    expect(timelineBlocks.length).toBe(1);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('renders multiple blocks', () => {
    const blocks = [
      makeBlock({ id: 'b1', startedAt: '2026-03-20T09:00:00.000Z', endedAt: '2026-03-20T10:00:00.000Z' }),
      makeBlock({ id: 'b2', taskName: 'Task 2', startedAt: '2026-03-20T10:30:00.000Z', endedAt: '2026-03-20T11:30:00.000Z' }),
    ];
    render(<TimelineBar blocks={blocks} />);
    const timelineBlocks = document.querySelectorAll('[data-cy="timeline-block"]');
    expect(timelineBlocks.length).toBe(2);
  });

  it('renders gaps between blocks', () => {
    const blocks = [
      makeBlock({ id: 'b1', startedAt: '2026-03-20T09:00:00.000Z', endedAt: '2026-03-20T10:00:00.000Z', durationMinutes: 60 }),
      makeBlock({ id: 'b2', taskName: 'Task 2', startedAt: '2026-03-20T11:00:00.000Z', endedAt: '2026-03-20T12:00:00.000Z', durationMinutes: 60 }),
    ];
    render(<TimelineBar blocks={blocks} />);
    const gaps = document.querySelectorAll('[data-cy="timeline-gap"]');
    expect(gaps.length).toBe(1);
  });

  it('calls onBlockClick when a block is clicked', () => {
    const onBlockClick = vi.fn();
    const blocks = [makeBlock()];
    render(<TimelineBar blocks={blocks} onBlockClick={onBlockClick} />);
    fireEvent.click(document.querySelector('[data-cy="timeline-block"]')!);
    expect(onBlockClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'block-1' }));
  });

  it('calls onGapClick when a gap is clicked', () => {
    const onGapClick = vi.fn();
    const blocks = [
      makeBlock({ id: 'b1', startedAt: '2026-03-20T09:00:00.000Z', endedAt: '2026-03-20T10:00:00.000Z', durationMinutes: 60 }),
      makeBlock({ id: 'b2', startedAt: '2026-03-20T11:00:00.000Z', endedAt: '2026-03-20T12:00:00.000Z', durationMinutes: 60 }),
    ];
    render(<TimelineBar blocks={blocks} onGapClick={onGapClick} />);
    const gap = document.querySelector('[data-cy="timeline-gap"]');
    expect(gap).toBeInTheDocument();
    fireEvent.click(gap!);
    expect(onGapClick).toHaveBeenCalledOnce();
  });

  it('renders running block with animate-pulse', () => {
    const blocks = [makeBlock({ endedAt: null, durationMinutes: 30 })];
    render(<TimelineBar blocks={blocks} />);
    const block = document.querySelector('[data-cy="timeline-block"]');
    expect(block?.className).toContain('animate-pulse');
  });

  it('applies custom className', () => {
    render(<TimelineBar blocks={[]} className="my-class" />);
    const bar = document.querySelector('[data-cy="timeline-bar"]');
    expect(bar?.className).toContain('my-class');
  });

  it('renders hour marks', () => {
    const blocks = [makeBlock()];
    render(<TimelineBar blocks={blocks} />);
    // Should render hour marks for the time range
    const hourLabels = screen.getAllByText(/\d{2}:00/);
    expect(hourLabels.length).toBeGreaterThan(0);
  });
});
