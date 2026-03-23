'use client';

import { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { DayTimeline } from '@/shared/ui/timeline';
import type { TimelineBlock, TimelineGap } from '@/shared/ui/timeline';
import { useTimeEntriesQuery, useUpdateTimeEntryMutation, useDeleteTimeEntryMutation } from '@/shared/api/time-entries';
import { useTasksQuery } from '@/shared/api/tasks';
import { useListsQuery } from '@/shared/api/lists';
import { useListNameMap, useListColorMap } from '@/shared/lib/listUtils';
import { mapTimeEntriesToBlocks, aggregateTimeByList, QuickAddFromGapDialog, EditTimeEntryDialog } from '@/features/timeline';
import type { TimelineBlockWithTaskId } from '@/features/timeline/model/mapTimeEntriesToBlocks';
import { DoughnutChart } from '@/shared/ui/charts';

export function CalendarDayPage() {
  const [selectedDate, setSelectedDate] = useState(() => dayjs());
  const [selectedGap, setSelectedGap] = useState<TimelineGap | null>(null);
  const [isGapDialogOpen, setIsGapDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimelineBlockWithTaskId | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: timeEntries = [] } = useTimeEntriesQuery();
  const { data: tasks = [] } = useTasksQuery();
  const { data: lists = [] } = useListsQuery();
  const listNameMap = useListNameMap();
  const listColorMap = useListColorMap();
  const updateTimeEntry = useUpdateTimeEntryMutation();
  const deleteTimeEntry = useDeleteTimeEntryMutation();

  const blocks = useMemo(
    () => mapTimeEntriesToBlocks(timeEntries, tasks, listNameMap, selectedDate, listColorMap),
    [timeEntries, tasks, listNameMap, selectedDate, listColorMap],
  );

  const doughnutSegments = useMemo(
    () => aggregateTimeByList(timeEntries, tasks, lists, selectedDate),
    [timeEntries, tasks, lists, selectedDate],
  );

  // Extract unique tasks shown for the current day (for the edit dialog combobox)
  const dayTasks = useMemo(() => {
    const seen = new Set<string>();
    return blocks
      .filter((b) => {
        if (seen.has(b.taskId)) return false;
        seen.add(b.taskId);
        return true;
      })
      .map((b) => ({ id: b.taskId, name: b.taskName, listId: b.listId }));
  }, [blocks]);

  const handlePrevDay = useCallback(() => {
    setSelectedDate((prev) => prev.subtract(1, 'day'));
  }, []);

  const handleNextDay = useCallback(() => {
    setSelectedDate((prev) => prev.add(1, 'day'));
  }, []);

  const handleBlockEditClick = useCallback(
    (block: TimelineBlock) => {
      const fullBlock = blocks.find((b) => b.id === block.id);
      if (fullBlock) {
        setEditingBlock(fullBlock);
        setIsEditDialogOpen(true);
      }
    },
    [blocks],
  );

  const handleEditSave = useCallback(
    (data: { startedAt: string; endedAt: string; taskId?: number; taskName?: string; listId?: number }) => {
      if (!editingBlock) return;
      updateTimeEntry.mutate({
        id: Number(editingBlock.id),
        ...data,
      });
    },
    [editingBlock, updateTimeEntry],
  );

  const handleEditDelete = useCallback(() => {
    if (!editingBlock) return;
    deleteTimeEntry.mutate(Number(editingBlock.id));
  }, [editingBlock, deleteTimeEntry]);

  const handleBlockDelete = useCallback(
    (block: TimelineBlock) => {
      deleteTimeEntry.mutate(Number(block.id));
    },
    [deleteTimeEntry],
  );

  const handleGapClick = useCallback((gap: TimelineGap) => {
    setSelectedGap(gap);
    setIsGapDialogOpen(true);
  }, []);

  const handleAddEntry = useCallback(
    (startTime: string, endTime: string) => {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const startDate = new Date(`${dateStr}T${startTime}:00`);
      const endDate = new Date(`${dateStr}T${endTime}:00`);
      const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
      setSelectedGap({
        startedAt: startDate.toISOString(),
        endedAt: endDate.toISOString(),
        durationMinutes,
      });
      setIsGapDialogOpen(true);
    },
    [selectedDate],
  );

  return (
    <div className="flex flex-col h-screen" data-cy="calendar-day-page">
      <div className="flex-1 overflow-y-auto">
        <DayTimeline
          date={selectedDate.toDate()}
          blocks={blocks}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onBlockEditClick={handleBlockEditClick}
          onBlockDelete={handleBlockDelete}
          onGapClick={handleGapClick}
          onAddEntry={handleAddEntry}
        />
        <div className="px-4 py-4 border-t border-border">
          <DoughnutChart segments={doughnutSegments} />
        </div>
      </div>
      <QuickAddFromGapDialog
        gap={selectedGap}
        open={isGapDialogOpen}
        onOpenChange={setIsGapDialogOpen}
        dayTasks={dayTasks}
      />
      <EditTimeEntryDialog
        block={editingBlock}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        date={selectedDate.toDate()}
        dayTasks={dayTasks}
        onSave={handleEditSave}
        onDelete={handleEditDelete}
      />
    </div>
  );
}
