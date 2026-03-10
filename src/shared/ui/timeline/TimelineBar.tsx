'use client';

import { useMemo } from 'react';
import { cn } from '@/shared/lib/utils';

export interface TimelineBlock {
  id: string;
  taskName: string;
  startedAt: string; // ISO datetime
  endedAt: string | null; // null = currently running
  listName: 'Work' | 'Personal' | string;
  durationMinutes: number | null;
}

interface TimelineBarProps {
  blocks: TimelineBlock[];
  onBlockClick?: (block: TimelineBlock) => void;
  className?: string;
}

const LIST_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  Work: {
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-800',
  },
  Personal: {
    bg: 'bg-violet-100',
    border: 'border-violet-300',
    text: 'text-violet-800',
  },
};

const DEFAULT_COLORS = {
  bg: 'bg-emerald-100',
  border: 'border-emerald-300',
  text: 'text-emerald-800',
};

function getListColors(listName: string) {
  return LIST_COLORS[listName] ?? DEFAULT_COLORS;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
}

function formatBlockDuration(minutes: number | null): string {
  if (minutes === null || minutes <= 0) return '';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function computeLayout(blocks: TimelineBlock[]) {
  if (blocks.length === 0) return { hourMarks: [], segments: [], startHour: 0, endHour: 0 };

  const now = new Date();

  const parsedBlocks = blocks.map((b) => ({
    ...b,
    start: new Date(b.startedAt),
    end: b.endedAt ? new Date(b.endedAt) : now,
  }));

  parsedBlocks.sort((a, b) => a.start.getTime() - b.start.getTime());

  const earliest = parsedBlocks[0].start;
  const latest = parsedBlocks.reduce(
    (max, b) => (b.end.getTime() > max.getTime() ? b.end : max),
    parsedBlocks[0].end
  );

  const startHour = earliest.getHours();
  const endHour = Math.min(latest.getHours() + 1, 24);
  const totalMinutes = (endHour - startHour) * 60;

  if (totalMinutes <= 0) return { hourMarks: [], segments: [], startHour: 0, endHour: 0 };

  const timelineStart = new Date(earliest);
  timelineStart.setHours(startHour, 0, 0, 0);

  const minutesFromStart = (date: Date) =>
    (date.getTime() - timelineStart.getTime()) / (1000 * 60);

  const hourMarks: { label: string; percent: number }[] = [];
  for (let h = startHour; h <= endHour; h++) {
    const percent = ((h - startHour) * 60 / totalMinutes) * 100;
    hourMarks.push({ label: `${h.toString().padStart(2, '0')}:00`, percent });
  }

  type Segment = {
    type: 'block' | 'gap';
    left: number;
    width: number;
    block?: typeof parsedBlocks[number];
  };

  const segments: Segment[] = [];
  let cursor = 0; // minutes from start

  for (const block of parsedBlocks) {
    const blockStart = minutesFromStart(block.start);
    const blockEnd = minutesFromStart(block.end);

    // Add gap if there's space before this block
    if (blockStart > cursor + 1) {
      segments.push({
        type: 'gap',
        left: (cursor / totalMinutes) * 100,
        width: ((blockStart - cursor) / totalMinutes) * 100,
      });
    }

    segments.push({
      type: 'block',
      left: (blockStart / totalMinutes) * 100,
      width: (Math.max(blockEnd - blockStart, 2) / totalMinutes) * 100,
      block,
    });

    cursor = blockEnd;
  }

  return { hourMarks, segments, startHour, endHour };
}

export function TimelineBar({ blocks, onBlockClick, className }: TimelineBarProps) {
  const layout = useMemo(() => computeLayout(blocks), [blocks]);

  if (blocks.length === 0) {
    return (
      <div
        data-cy="timeline-bar"
        className={cn(
          'rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 px-4 py-6 text-center',
          className
        )}
      >
        <p className="text-sm text-muted-foreground">No time entries for today</p>
      </div>
    );
  }

  return (
    <div data-cy="timeline-bar" className={cn('space-y-1', className)}>
      {/* Hour marks */}
      <div className="relative h-4">
        {layout.hourMarks.map((mark) => (
          <span
            key={mark.label}
            className="absolute text-[10px] text-muted-foreground -translate-x-1/2 select-none"
            style={{ left: `${mark.percent}%` }}
          >
            {mark.label}
          </span>
        ))}
      </div>

      {/* Timeline track */}
      <div className="relative h-10 rounded-md bg-muted/40 overflow-hidden">
        {layout.segments.map((seg, i) => {
          if (seg.type === 'gap') {
            return (
              <div
                key={`gap-${i}`}
                className="absolute top-0 bottom-0 bg-muted/60"
                style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
              />
            );
          }

          const block = seg.block!;
          const isRunning = block.endedAt === null;
          const colors = getListColors(block.listName);
          const durationStr = isRunning
            ? formatBlockDuration(block.durationMinutes) || 'running'
            : formatBlockDuration(block.durationMinutes);

          return (
            <button
              key={block.id}
              data-cy="timeline-block"
              className={cn(
                'absolute top-0.5 bottom-0.5 rounded border transition-opacity hover:opacity-80',
                'flex items-center gap-1 px-1.5 overflow-hidden cursor-pointer',
                colors.bg,
                colors.border,
                isRunning && 'animate-pulse'
              )}
              style={{ left: `${seg.left}%`, width: `${seg.width}%` }}
              onClick={() => onBlockClick?.(block)}
              title={`${block.taskName} (${formatTime(block.start)} - ${isRunning ? 'now' : formatTime(block.end)})`}
            >
              <span
                className={cn('text-[11px] font-medium truncate', colors.text)}
              >
                {block.taskName}
              </span>
              {seg.width > 8 && (
                <span className={cn('text-[10px] flex-shrink-0 opacity-70', colors.text)}>
                  {durationStr}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Labels below blocks */}
      <div className="relative h-4">
        {layout.segments
          .filter((s) => s.type === 'block' && s.width < 8)
          .map((seg) => {
            const block = seg.block!;
            return (
              <span
                key={`label-${block.id}`}
                className="absolute text-[10px] text-muted-foreground truncate max-w-[80px] -translate-x-1/4"
                style={{ left: `${seg.left}%` }}
              >
                {block.taskName}
              </span>
            );
          })}
      </div>
    </div>
  );
}
