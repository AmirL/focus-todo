'use client';
import { TimeSpentBadge } from '@/shared/ui/timer';
import { useTimeEntriesQuery } from '@/shared/api/time-entries';

interface TaskTimeSpentBadgeProps {
  taskId: number;
  estimatedMinutes?: number | null;
}

export function TaskTimeSpentBadge({ taskId, estimatedMinutes }: TaskTimeSpentBadgeProps) {
  const { data: entries } = useTimeEntriesQuery();

  const taskEntries = entries?.filter((e) => e.taskId === taskId) ?? [];
  const totalMinutes = taskEntries.reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0);

  if (totalMinutes <= 0) return null;

  return (
    <TimeSpentBadge
      actualMinutes={totalMinutes}
      estimatedMinutes={estimatedMinutes}
    />
  );
}
