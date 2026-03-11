import dayjs from 'dayjs';
import type { TimeEntry } from '@/shared/api/time-entries';
import type { TaskModel } from '@/entities/task/model/task';
import type { TimelineBlock } from '@/shared/ui/timeline';

export type TimelineBlockWithTaskId = TimelineBlock & { taskId: string };

export function mapTimeEntriesToBlocks(
  timeEntries: TimeEntry[],
  tasks: TaskModel[],
  listNameMap: Map<number, string>,
): TimelineBlockWithTaskId[] {
  const today = dayjs();
  const taskMap = new Map(tasks.map((t) => [Number(t.id), t]));

  return timeEntries
    .filter((entry) => dayjs(entry.startedAt).isSame(today, 'day'))
    .map((entry) => {
      const task = taskMap.get(entry.taskId);
      const listName = task ? (listNameMap.get(task.listId) ?? 'Unknown') : 'Unknown';

      return {
        id: String(entry.id),
        taskName: task?.name ?? 'Unknown task',
        startedAt: entry.startedAt,
        endedAt: entry.endedAt,
        listName,
        durationMinutes: entry.durationMinutes,
        taskId: String(entry.taskId),
      };
    });
}
