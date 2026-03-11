'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/shared/lib/utils';
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import type { TimelineBlock, TimelineGap } from './TimelineBar';

const START_HOUR = 8;
const END_HOUR = 23;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const HOUR_HEIGHT_PX = 64;

interface DayTimelineProps {
  date: Date;
  blocks: TimelineBlock[];
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onBlockEdit?: (block: TimelineBlock, startTime: string, endTime: string) => void;
  onBlockDelete?: (block: TimelineBlock) => void;
  onGapClick?: (gap: TimelineGap) => void;
  className?: string;
}

const LIST_COLORS: Record<string, { bg: string; border: string; text: string; hover: string }> = {
  Work: {
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    text: 'text-blue-800',
    hover: 'hover:bg-blue-200',
  },
  Personal: {
    bg: 'bg-violet-100',
    border: 'border-violet-300',
    text: 'text-violet-800',
    hover: 'hover:bg-violet-200',
  },
};

const DEFAULT_COLORS = {
  bg: 'bg-emerald-100',
  border: 'border-emerald-300',
  text: 'text-emerald-800',
  hover: 'hover:bg-emerald-200',
};

function getListColors(listName: string) {
  return LIST_COLORS[listName] ?? DEFAULT_COLORS;
}

function formatDuration(minutes: number | null): string {
  if (minutes === null || minutes <= 0) return '';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function formatDateHeader(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function timeToMinutesFromStart(isoString: string): number {
  const d = new Date(isoString);
  return (d.getHours() - START_HOUR) * 60 + d.getMinutes();
}

function minutesToTop(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT_PX;
}

function minutesToHeight(minutes: number): number {
  return Math.max((minutes / 60) * HOUR_HEIGHT_PX, 24);
}

function formatTimeHHMM(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

interface BlockPosition {
  block: TimelineBlock;
  topPx: number;
  heightPx: number;
  startMin: number;
  endMin: number;
}

interface GapPosition {
  gap: TimelineGap;
  topPx: number;
  heightPx: number;
}

function computeVerticalLayout(blocks: TimelineBlock[]): {
  blockPositions: BlockPosition[];
  gapPositions: GapPosition[];
} {
  const now = new Date();

  const sorted = [...blocks]
    .map((b) => {
      const startMin = timeToMinutesFromStart(b.startedAt);
      const endMin = b.endedAt
        ? timeToMinutesFromStart(b.endedAt)
        : (now.getHours() - START_HOUR) * 60 + now.getMinutes();
      return { block: b, startMin, endMin };
    })
    .sort((a, b) => a.startMin - b.startMin);

  const blockPositions: BlockPosition[] = sorted.map(({ block, startMin, endMin }) => ({
    block,
    topPx: minutesToTop(startMin),
    heightPx: minutesToHeight(endMin - startMin),
    startMin,
    endMin,
  }));

  const gapPositions: GapPosition[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = sorted[i].endMin;
    const nextStart = sorted[i + 1].startMin;
    if (nextStart - currentEnd > 1) {
      const gapDuration = nextStart - currentEnd;
      const baseDate = new Date(sorted[i].block.startedAt);
      const gapStartDate = new Date(baseDate);
      gapStartDate.setHours(START_HOUR + Math.floor(currentEnd / 60), currentEnd % 60, 0, 0);
      const gapEndDate = new Date(baseDate);
      gapEndDate.setHours(START_HOUR + Math.floor(nextStart / 60), nextStart % 60, 0, 0);

      gapPositions.push({
        gap: {
          startedAt: gapStartDate.toISOString(),
          endedAt: gapEndDate.toISOString(),
          durationMinutes: gapDuration,
        },
        topPx: minutesToTop(currentEnd),
        heightPx: minutesToHeight(gapDuration),
      });
    }
  }

  return { blockPositions, gapPositions };
}

function TimeBlockInlineEditor({
  startTime,
  endTime,
  onSave,
  onCancel,
}: {
  startTime: string;
  endTime: string;
  onSave: (start: string, end: string) => void;
  onCancel: () => void;
}) {
  const [start, setStart] = useState(startTime);
  const [end, setEnd] = useState(endTime);

  return (
    <div
      className="flex items-center gap-1.5 mt-1"
      data-cy="day-timeline-inline-editor"
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="time"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="w-[70px] rounded border border-gray-300 bg-white px-1 py-0.5 text-xs text-gray-900"
        data-cy="day-timeline-edit-start"
      />
      <span className="text-xs text-gray-500">-</span>
      <input
        type="time"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        className="w-[70px] rounded border border-gray-300 bg-white px-1 py-0.5 text-xs text-gray-900"
        data-cy="day-timeline-edit-end"
      />
      <button
        onClick={() => onSave(start, end)}
        className="rounded bg-green-600 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-green-700"
        data-cy="day-timeline-edit-save"
      >
        Save
      </button>
      <button
        onClick={onCancel}
        className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-300"
        data-cy="day-timeline-edit-cancel"
      >
        Cancel
      </button>
    </div>
  );
}

function TimeBlock({
  position,
  onEdit,
  onDelete,
  isEditing,
  onStartEdit,
  onCancelEdit,
}: {
  position: BlockPosition;
  onEdit?: (block: TimelineBlock, startTime: string, endTime: string) => void;
  onDelete?: (block: TimelineBlock) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}) {
  const { block, topPx, heightPx } = position;
  const isRunning = block.endedAt === null;
  const colors = getListColors(block.listName);
  const durationStr = isRunning
    ? formatDuration(block.durationMinutes) || 'running'
    : formatDuration(block.durationMinutes);

  const handleSave = useCallback(
    (start: string, end: string) => {
      onEdit?.(block, start, end);
      onCancelEdit();
    },
    [block, onEdit, onCancelEdit]
  );

  const isShort = heightPx < 48;

  return (
    <div
      data-cy="day-timeline-block"
      className={cn(
        'absolute left-16 right-2 rounded-lg border transition-colors cursor-pointer',
        'flex flex-col px-3 py-1.5 overflow-hidden',
        colors.bg,
        colors.border,
        colors.hover,
        isRunning && 'animate-pulse'
      )}
      style={{ top: `${topPx}px`, height: `${heightPx}px` }}
      onClick={onStartEdit}
    >
      <div className="flex items-center justify-between gap-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className={cn('text-sm font-medium truncate', colors.text)}>
            {block.taskName}
          </span>
          {!isShort && (
            <span className={cn('text-xs opacity-70 flex-shrink-0', colors.text)}>
              {durationStr}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            data-cy="day-timeline-edit-btn"
            className={cn(
              'rounded p-0.5 transition-colors',
              'hover:bg-black/10'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit();
            }}
          >
            <Pencil className={cn('h-3.5 w-3.5', colors.text)} />
          </button>
          {onDelete && (
            <button
              data-cy="day-timeline-delete-btn"
              className="rounded p-0.5 transition-colors hover:bg-red-200"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(block);
              }}
            >
              <Trash2 className="h-3.5 w-3.5 text-red-600" />
            </button>
          )}
        </div>
      </div>
      {isShort && (
        <span className={cn('text-[10px] opacity-70', colors.text)}>{durationStr}</span>
      )}
      {isEditing && (
        <TimeBlockInlineEditor
          startTime={formatTimeHHMM(block.startedAt)}
          endTime={block.endedAt ? formatTimeHHMM(block.endedAt) : formatTimeHHMM(new Date().toISOString())}
          onSave={handleSave}
          onCancel={onCancelEdit}
        />
      )}
    </div>
  );
}

function GapBlock({
  position,
  onClick,
}: {
  position: GapPosition;
  onClick?: (gap: TimelineGap) => void;
}) {
  const { gap, topPx, heightPx } = position;

  return (
    <button
      data-cy="day-timeline-gap"
      className={cn(
        'absolute left-16 right-2 rounded-lg border border-dashed border-transparent',
        'transition-colors flex items-center justify-center',
        onClick
          ? 'hover:bg-orange-50 hover:border-orange-300 cursor-pointer'
          : 'cursor-default'
      )}
      style={{ top: `${topPx}px`, height: `${heightPx}px` }}
      onClick={() => onClick?.(gap)}
      title={`Gap: ${formatTimeHHMM(gap.startedAt)} - ${formatTimeHHMM(gap.endedAt)} (${formatDuration(gap.durationMinutes)})`}
    >
      {onClick && heightPx > 32 && (
        <span className="text-xs text-orange-400 opacity-0 hover:opacity-100 transition-opacity">
          + Add entry
        </span>
      )}
    </button>
  );
}

export function DayTimeline({
  date,
  blocks,
  onPrevDay,
  onNextDay,
  onBlockEdit,
  onBlockDelete,
  onGapClick,
  className,
}: DayTimelineProps) {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const layout = useMemo(() => computeVerticalLayout(blocks), [blocks]);
  const totalHeight = TOTAL_HOURS * HOUR_HEIGHT_PX;

  const hours = useMemo(() => {
    const result: number[] = [];
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      result.push(h);
    }
    return result;
  }, []);

  return (
    <div data-cy="day-timeline" className={cn('flex flex-col', className)}>
      {/* Date header */}
      <div
        data-cy="day-timeline-header"
        className="flex items-center justify-between px-4 py-3 border-b border-border"
      >
        <button
          data-cy="day-timeline-prev"
          onClick={onPrevDay}
          className="rounded-full p-1.5 hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </button>
        <h2 className="text-base font-semibold text-foreground">{formatDateHeader(date)}</h2>
        <button
          data-cy="day-timeline-next"
          onClick={onNextDay}
          className="rounded-full p-1.5 hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Timeline grid */}
      <div className="relative overflow-y-auto" style={{ height: `${totalHeight}px` }}>
        {/* Hour grid lines and labels */}
        {hours.map((h) => {
          const topPx = (h - START_HOUR) * HOUR_HEIGHT_PX;
          return (
            <div key={h} className="absolute left-0 right-0" style={{ top: `${topPx}px` }}>
              <div className="flex items-start">
                <span className="w-14 text-right pr-2 text-xs text-muted-foreground -translate-y-1/2 select-none">
                  {`${h.toString().padStart(2, '0')}:00`}
                </span>
                <div className="flex-1 border-t border-border/40" />
              </div>
            </div>
          );
        })}

        {/* Time blocks */}
        {layout.blockPositions.map((pos) => (
          <TimeBlock
            key={pos.block.id}
            position={pos}
            onEdit={onBlockEdit}
            onDelete={onBlockDelete}
            isEditing={editingBlockId === pos.block.id}
            onStartEdit={() => setEditingBlockId(pos.block.id)}
            onCancelEdit={() => setEditingBlockId(null)}
          />
        ))}

        {/* Gaps */}
        {layout.gapPositions.map((pos, i) => (
          <GapBlock key={`gap-${i}`} position={pos} onClick={onGapClick} />
        ))}

        {/* Empty state */}
        {blocks.length === 0 && (
          <div
            data-cy="day-timeline-empty"
            className="absolute inset-0 flex items-center justify-center"
          >
            <p className="text-sm text-muted-foreground">No time entries for this day</p>
          </div>
        )}
      </div>
    </div>
  );
}

export type { DayTimelineProps };
