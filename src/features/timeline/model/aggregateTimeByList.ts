import dayjs from 'dayjs';
import type { TimeEntry } from '@/shared/api/time-entries';
import type { TaskModel } from '@/entities/task/model/task';
import type { ListModel } from '@/entities/list/model/list';
import type { DoughnutSegment } from '@/shared/ui/charts';
import { getListColorHex } from '@/shared/lib/colors';

/**
 * Aggregate time entries for a given day by list (category),
 * returning data ready for the DoughnutChart component.
 */
export function aggregateTimeByList(
  timeEntries: TimeEntry[],
  tasks: TaskModel[],
  lists: ListModel[],
  date?: dayjs.Dayjs,
): DoughnutSegment[] {
  const targetDate = date ?? dayjs();
  const taskMap = new Map(tasks.map((t) => [Number(t.id), t]));
  const listMap = new Map(lists.map((l) => [l.id, l]));

  // Sum minutes per list
  const listTotals = new Map<string, { name: string; minutes: number; color: string }>();

  for (const entry of timeEntries) {
    if (!dayjs(entry.startedAt).isSame(targetDate, 'day')) continue;
    if (!entry.durationMinutes || entry.durationMinutes <= 0) continue;

    const task = taskMap.get(entry.taskId);
    const listId = task ? String(task.listId) : null;
    const list = listId ? listMap.get(listId) : null;

    const listName = list?.name ?? 'Other';
    const listColor = list?.color ?? null;

    const existing = listTotals.get(listName);
    if (existing) {
      existing.minutes += entry.durationMinutes;
    } else {
      listTotals.set(listName, {
        name: listName,
        minutes: entry.durationMinutes,
        color: getListColorHex(listColor),
      });
    }
  }

  // Sort by minutes descending
  return Array.from(listTotals.values()).sort((a, b) => b.minutes - a.minutes);
}
