'use client';

import { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { DayTimeline } from '@/shared/ui/timeline';
import type { TimelineBlock, TimelineGap } from '@/shared/ui/timeline';
import { useTimeEntriesQuery, useUpdateTimeEntryMutation, useDeleteTimeEntryMutation } from '@/shared/api/time-entries';
import { useTasksQuery } from '@/shared/api/tasks';
import { useListsQuery } from '@/shared/api/lists';
import { useListNameMap, useListColorMap } from '@/shared/lib/listUtils';
import { mapTimeEntriesToBlocks, aggregateTimeByList, QuickAddFromGapDialog } from '@/features/timeline';
import { DoughnutChart } from '@/shared/ui/charts';

export function CalendarDayPage() {
  const [selectedDate, setSelectedDate] = useState(() => dayjs());
  const [selectedGap, setSelectedGap] = useState<TimelineGap | null>(null);
  const [isGapDialogOpen, setIsGapDialogOpen] = useState(false);

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

  const handlePrevDay = useCallback(() => {
    setSelectedDate((prev) => prev.subtract(1, 'day'));
  }, []);

  const handleNextDay = useCallback(() => {
    setSelectedDate((prev) => prev.add(1, 'day'));
  }, []);

  const handleBlockEdit = useCallback(
    (block: TimelineBlock, startTime: string, endTime: string) => {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      updateTimeEntry.mutate({
        id: Number(block.id),
        startedAt: new Date(`${dateStr}T${startTime}:00`).toISOString(),
        endedAt: new Date(`${dateStr}T${endTime}:00`).toISOString(),
      });
    },
    [selectedDate, updateTimeEntry],
  );

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
          onBlockEdit={handleBlockEdit}
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
      />
    </div>
  );
}
