'use client';

import { useMemo, useCallback, useState } from 'react';
import { TimelineBar, type TimelineBlock, type TimelineGap } from '@/shared/ui/timeline';
import { useTimeEntriesQuery } from '@/shared/api/time-entries';
import { useTasksQuery } from '@/shared/api/tasks';
import { useListsQuery } from '@/shared/api/lists';
import { useListNameMap, useListColorMap } from '@/shared/lib/listUtils';
import { mapTimeEntriesToBlocks, type TimelineBlockWithTaskId } from '../model/mapTimeEntriesToBlocks';
import { aggregateTimeByList } from '../model/aggregateTimeByList';
import { QuickAddFromGapDialog } from './QuickAddFromGapDialog';
import { DoughnutChart } from '@/shared/ui/charts';

export function TodayTimeline() {
  const { data: timeEntries = [] } = useTimeEntriesQuery();
  const { data: tasks = [] } = useTasksQuery();
  const { data: lists = [] } = useListsQuery();
  const listNameMap = useListNameMap();
  const listColorMap = useListColorMap();
  const [selectedGap, setSelectedGap] = useState<TimelineGap | null>(null);
  const [isGapDialogOpen, setIsGapDialogOpen] = useState(false);

  const blocks = useMemo(
    () => mapTimeEntriesToBlocks(timeEntries, tasks, listNameMap, listColorMap),
    [timeEntries, tasks, listNameMap, listColorMap],
  );

  const doughnutSegments = useMemo(
    () => aggregateTimeByList(timeEntries, tasks, lists),
    [timeEntries, tasks, lists],
  );

  const handleBlockClick = useCallback((block: TimelineBlock) => {
    const taskId = (block as TimelineBlockWithTaskId).taskId;
    if (!taskId) return;

    // Find the task element in the list and scroll to it
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    if (taskElement) {
      taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Briefly highlight the task
      taskElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      setTimeout(() => {
        taskElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }, 2000);
    }
  }, []);

  const handleGapClick = useCallback((gap: TimelineGap) => {
    setSelectedGap(gap);
    setIsGapDialogOpen(true);
  }, []);

  return (
    <div className="px-2 sm:px-4" data-cy="today-timeline">
      <TimelineBar
        blocks={blocks}
        onBlockClick={handleBlockClick}
        onGapClick={handleGapClick}
        className="mb-2"
      />
      <DoughnutChart segments={doughnutSegments} className="mt-4" />
      <QuickAddFromGapDialog
        gap={selectedGap}
        open={isGapDialogOpen}
        onOpenChange={setIsGapDialogOpen}
      />
    </div>
  );
}
