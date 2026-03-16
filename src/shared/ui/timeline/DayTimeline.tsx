'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@/shared/lib/utils';
import { getColorClasses } from '@/shared/lib/colors';
import { formatDuration } from '@/shared/lib/format-duration';
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react';
import type { TimelineBlock, TimelineGap } from './TimelineBar';

const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 23;
const HOUR_HEIGHT_PX = 64;
/** Maximum number of side-by-side columns for overlapping entries */
const MAX_COLUMNS = 4;

interface DayTimelineProps {
  date: Date;
  blocks: TimelineBlock[];
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onBlockEdit?: (block: TimelineBlock, startTime: string, endTime: string) => void;
  onBlockDelete?: (block: TimelineBlock) => void;
  onGapClick?: (gap: TimelineGap) => void;
  onAddEntry?: (startTime: string, endTime: string) => void;
  className?: string;
}

function formatDateHeader(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function computeHourRange(blocks: TimelineBlock[]): { startHour: number; endHour: number } {
  if (blocks.length === 0) return { startHour: DEFAULT_START_HOUR, endHour: DEFAULT_END_HOUR };

  const now = new Date();
  let minHour = DEFAULT_START_HOUR;
  let maxHour = DEFAULT_END_HOUR;

  for (const b of blocks) {
    const startDate = new Date(b.startedAt);
    const startH = startDate.getHours();
    const endDate = b.endedAt ? new Date(b.endedAt) : now;
    // End hour needs to round up if there are minutes
    const endH = endDate.getMinutes() > 0 ? endDate.getHours() + 1 : endDate.getHours();

    if (startH < minHour) minHour = startH;
    if (endH > maxHour) maxHour = endH;
  }

  // Clamp to valid range
  return { startHour: Math.max(0, minHour), endHour: Math.min(24, maxHour) };
}

function timeToMinutesFromStart(isoString: string, startHour: number): number {
  const d = new Date(isoString);
  return (d.getHours() - startHour) * 60 + d.getMinutes();
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
  /** Column index within a short-entry cluster (0-based). undefined = full width. */
  column?: number;
  /** Total columns in the cluster. */
  totalColumns?: number;
}

interface GapPosition {
  gap: TimelineGap;
  topPx: number;
  heightPx: number;
}

/**
 * Checks if two blocks visually overlap based on their rendered positions.
 * Uses rendered height (with min-height) rather than time-based height,
 * so short entries expanded by min-height are correctly detected as overlapping.
 */
function blocksVisuallyOverlap(a: BlockPosition, b: BlockPosition): boolean {
  const aBottom = a.topPx + a.heightPx;
  const bBottom = b.topPx + b.heightPx;
  return a.topPx < bBottom && b.topPx < aBottom;
}

/**
 * Assigns columns to overlapping entries using a greedy algorithm (like Google Calendar).
 * Instead of pushing overlapping entries down (which cascades and displaces them),
 * overlapping entries are placed side-by-side in columns at their correct time positions.
 */
function assignOverlapColumns(positions: BlockPosition[]): void {
  if (positions.length === 0) return;

  // Find connected overlap groups
  const visited = new Set<number>();
  const groups: number[][] = [];

  for (let i = 0; i < positions.length; i++) {
    if (visited.has(i)) continue;

    // BFS to find all entries connected by visual overlap
    const group: number[] = [];
    const queue = [i];
    visited.add(i);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      group.push(curr);

      for (let j = 0; j < positions.length; j++) {
        if (visited.has(j)) continue;
        if (blocksVisuallyOverlap(positions[curr], positions[j])) {
          visited.add(j);
          queue.push(j);
        }
      }
    }

    if (group.length >= 2) {
      groups.push(group);
    }
  }

  // For each overlap group, assign columns greedily
  for (const group of groups) {
    // Sort group members by start time
    group.sort((a, b) => positions[a].startMin - positions[b].startMin);

    // columns[c] = rendered bottom (topPx + heightPx) of the last entry in column c
    const columns: number[] = [];

    for (const idx of group) {
      const pos = positions[idx];

      // Find first column where this entry doesn't visually overlap
      let placed = false;
      for (let c = 0; c < columns.length && c < MAX_COLUMNS; c++) {
        if (pos.topPx >= columns[c]) {
          // Fits in this column
          pos.column = c;
          columns[c] = pos.topPx + pos.heightPx;
          placed = true;
          break;
        }
      }

      if (!placed) {
        // New column needed
        pos.column = columns.length;
        columns.push(pos.topPx + pos.heightPx);
      }
    }

    // Set totalColumns for all entries in the group
    const totalCols = Math.min(columns.length, MAX_COLUMNS);
    for (const idx of group) {
      positions[idx].totalColumns = totalCols;
      // Clamp column index if we exceeded MAX_COLUMNS
      if (positions[idx].column! >= totalCols) {
        positions[idx].column = totalCols - 1;
      }
    }
  }
}

function computeVerticalLayout(blocks: TimelineBlock[], startHour: number): {
  blockPositions: BlockPosition[];
  gapPositions: GapPosition[];
} {
  const now = new Date();

  const sorted = [...blocks]
    .map((b) => {
      const startMin = timeToMinutesFromStart(b.startedAt, startHour);
      const endMin = b.endedAt
        ? timeToMinutesFromStart(b.endedAt, startHour)
        : (now.getHours() - startHour) * 60 + now.getMinutes();
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

  // Assign columns for overlapping entries (side-by-side, like Google Calendar)
  assignOverlapColumns(blockPositions);

  // Compute gaps between non-overlapping consecutive entries
  // For entries in columns, use the last entry in the overlap group as the "end"
  const gapPositions: GapPosition[] = [];
  for (let idx = 0; idx < blockPositions.length - 1; idx++) {
    const curr = blockPositions[idx];
    const next = blockPositions[idx + 1];

    // Skip gap computation within overlap groups (entries are side-by-side)
    if (curr.column !== undefined && next.column !== undefined && blocksVisuallyOverlap(curr, next)) {
      continue;
    }

    const currentEnd = sorted[idx].endMin;
    const nextStart = sorted[idx + 1].startMin;
    if (nextStart - currentEnd > 1) {
      const gapDuration = nextStart - currentEnd;
      const baseDate = new Date(sorted[idx].block.startedAt);
      const gapStartDate = new Date(baseDate);
      gapStartDate.setHours(startHour + Math.floor(currentEnd / 60), currentEnd % 60, 0, 0);
      const gapEndDate = new Date(baseDate);
      gapEndDate.setHours(startHour + Math.floor(nextStart / 60), nextStart % 60, 0, 0);

      const gapTop = minutesToTop(currentEnd);
      const gapBottom = minutesToTop(nextStart);
      const gapHeight = Math.max(gapBottom - gapTop, 0);

      if (gapHeight > 0) {
        gapPositions.push({
          gap: {
            startedAt: gapStartDate.toISOString(),
            endedAt: gapEndDate.toISOString(),
            durationMinutes: gapDuration,
          },
          topPx: gapTop,
          heightPx: gapHeight,
        });
      }
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
  const colors = getColorClasses(block.listColor);
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

  const hasColumns = position.column !== undefined && position.totalColumns !== undefined;
  const isShort = hasColumns || heightPx < 48;
  const isVeryShort = !hasColumns && heightPx < 32;
  const tooltipText = `${block.taskName} (${formatTimeHHMM(block.startedAt)}–${block.endedAt ? formatTimeHHMM(block.endedAt) : 'now'})${durationStr ? ` ${durationStr}` : ''}`;

  // Column layout: compute left/width for side-by-side positioning
  const columnStyle: React.CSSProperties = hasColumns
    ? {
        left: `calc(4rem + (100% - 4rem - 0.5rem) * ${position.column! / position.totalColumns!})`,
        width: `calc((100% - 4rem - 0.5rem) / ${position.totalColumns!} - 2px)`,
      }
    : {};

  return (
    <div
      data-cy="day-timeline-block"
      className={cn(
        'absolute rounded-lg border transition-colors cursor-pointer group/block',
        'flex flex-col px-3 py-1.5 overflow-hidden',
        !hasColumns && 'left-16 right-2',
        isVeryShort && 'hover:overflow-visible hover:z-20 hover:h-auto hover:min-h-[32px]',
        colors.bg,
        colors.border,
        colors.hover,
        isRunning && 'animate-pulse'
      )}
      style={{ top: `${topPx}px`, height: `${heightPx}px`, ...columnStyle }}
      title={isShort ? tooltipText : undefined}
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
        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover/block:opacity-100 transition-opacity">
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
      {hasColumns && (
        <span className={cn('text-[10px] opacity-70', colors.text)}>
          {formatTimeHHMM(block.startedAt)}–{block.endedAt ? formatTimeHHMM(block.endedAt) : 'now'}
        </span>
      )}
      {isShort && !hasColumns && (
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
  onAddEntry,
  className,
}: DayTimelineProps) {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const { startHour, endHour } = useMemo(() => computeHourRange(blocks), [blocks]);
  const totalHours = endHour - startHour;
  const layout = useMemo(() => computeVerticalLayout(blocks, startHour), [blocks, startHour]);
  const totalHeight = totalHours * HOUR_HEIGHT_PX;

  const hours = useMemo(() => {
    const result: number[] = [];
    for (let h = startHour; h <= endHour; h++) {
      result.push(h);
    }
    return result;
  }, [startHour, endHour]);

  return (
    <div data-cy="day-timeline" className={cn('flex flex-col', className)}>
      {/* Date header */}
      <div
        data-cy="day-timeline-header"
        className="flex items-center justify-between pl-14 pr-4 md:px-4 py-3 border-b border-border"
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
      <div className="relative" style={{ minHeight: `${totalHeight}px` }}>
        {/* Hour grid lines and labels */}
        {hours.map((h) => {
          const topPx = (h - startHour) * HOUR_HEIGHT_PX;
          const startTime = `${h.toString().padStart(2, '0')}:00`;
          const nextH = h + 1;
          const endTime = `${nextH.toString().padStart(2, '0')}:00`;
          return (
            <div key={h} className="absolute left-0 right-0 group/hour" style={{ top: `${topPx}px`, height: `${HOUR_HEIGHT_PX}px` }}>
              <div className="flex items-start">
                <span className="w-14 text-right pr-2 text-xs text-muted-foreground -translate-y-1/2 select-none">
                  {startTime}
                </span>
                <div className="flex-1 border-t border-border/40" />
              </div>
              {onAddEntry && h < endHour && (
                <button
                  data-cy="day-timeline-add-entry"
                  className="absolute right-2 top-1 z-10 opacity-0 group-hover/hour:opacity-100 transition-opacity rounded-full p-0.5 bg-primary/10 hover:bg-primary/20 text-primary"
                  onClick={() => onAddEntry(startTime, endTime)}
                  title={`Add entry at ${startTime}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
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

