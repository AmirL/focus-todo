import dayjs from 'dayjs';
import type { TimeEntry } from '@/shared/api/time-entries';
import type { TaskModel } from '@/entities/task/model/task';
import type { ListModel } from '@/entities/list/model/list';
import type { DoughnutSegment } from '@/shared/ui/charts';
import { getListColorHex } from '@/shared/lib/colors';

/**
 * Aggregate time entries for a given day by list (category),
 * returning data ready for the DoughnutChart component.
 *
 * Uses String keys for all map lookups to avoid type mismatches
 * between number and string IDs at runtime.
 */
export function aggregateTimeByList(
  timeEntries: TimeEntry[],
  tasks: TaskModel[],
  lists: ListModel[],
  date?: dayjs.Dayjs,
): DoughnutSegment[] {
  const targetDate = date ?? dayjs();
  const taskMap = new Map(tasks.map((t) => [String(t.id), t]));
  const listMap = new Map(lists.map((l) => [String(l.id), l]));

  // Sum minutes per list
  const listTotals = new Map<string, { name: string; minutes: number; color: string }>();

  for (const entry of timeEntries) {
    if (!dayjs(entry.startedAt).isSame(targetDate, 'day')) continue;
    if (!entry.durationMinutes || entry.durationMinutes <= 0) continue;

    const task = taskMap.get(String(entry.taskId));
    const listId = task ? task.listId : null;
    const list = listId != null ? listMap.get(String(listId)) : null;

    const listName = list?.name ?? 'Other';
    const listColor = list?.color ?? null;

    const key = listId != null ? String(listId) : '__none__';
    const existing = listTotals.get(key);
    if (existing) {
      existing.minutes += entry.durationMinutes;
    } else {
      listTotals.set(key, {
        name: listName,
        minutes: entry.durationMinutes,
        color: getListColorHex(listColor),
      });
    }
  }

  // Sort by minutes descending
  return Array.from(listTotals.values()).sort((a, b) => b.minutes - a.minutes);
}
