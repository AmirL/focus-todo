'use client';

import { useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { DayTimeline } from '@/shared/ui/timeline';
import type { TimelineBlock, TimelineGap } from '@/shared/ui/timeline';
import { useTimeEntriesQuery, useUpdateTimeEntryMutation, useDeleteTimeEntryMutation } from '@/shared/api/time-entries';
import { useTasksQuery } from '@/shared/api/tasks';
import { useListNameMap } from '@/shared/lib/listUtils';
import { mapTimeEntriesToBlocks } from '@/features/timeline/model/mapTimeEntriesToBlocks';
import { QuickAddFromGapDialog } from '@/features/timeline/ui/QuickAddFromGapDialog';

export function CalendarDayPage() {
  const [selectedDate, setSelectedDate] = useState(() => dayjs());
  const [selectedGap, setSelectedGap] = useState<TimelineGap | null>(null);
  const [isGapDialogOpen, setIsGapDialogOpen] = useState(false);

  const { data: timeEntries = [] } = useTimeEntriesQuery();
  const { data: tasks = [] } = useTasksQuery();
  const listNameMap = useListNameMap();
  const updateTimeEntry = useUpdateTimeEntryMutation();
  const deleteTimeEntry = useDeleteTimeEntryMutation();

  const blocks = useMemo(
    () => mapTimeEntriesToBlocks(timeEntries, tasks, listNameMap, selectedDate),
    [timeEntries, tasks, listNameMap, selectedDate],
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
        />
      </div>
      <QuickAddFromGapDialog
        gap={selectedGap}
        open={isGapDialogOpen}
        onOpenChange={setIsGapDialogOpen}
      />
    </div>
  );
}
