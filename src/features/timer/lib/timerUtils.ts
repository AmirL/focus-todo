import dayjs from 'dayjs';
import type { TimeEntry } from '@/shared/api/time-entries';

/** Parse a local time string (HH:mm) onto a base date, returning a dayjs instance */
export function getLocalDayjs(base: string, localTime: string): dayjs.Dayjs {
  const [h, m] = localTime.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return dayjs(base);
  return dayjs(base).hour(h).minute(m).second(0);
}

/** Calculate duration in minutes between two moments (minimum 0) */
export function calculateDiffMinutes(start: dayjs.Dayjs, end: dayjs.Dayjs): number {
  return Math.max(0, end.diff(start, 'minute'));
}

/** Format a duration in minutes as a human-readable string */
export function formatTimerDuration(diffMinutes: number): string {
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/** Calculate total time spent on a specific task from time entries */
export function calculateTaskTimeSpent(entries: TimeEntry[], taskId: number): number {
  const taskEntries = entries.filter((e) => e.taskId === taskId);
  return taskEntries.reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0);
}

/** Find the currently running entry (no endedAt) from a list of entries */
export function findRunningEntry(entries: TimeEntry[]): TimeEntry | undefined {
  return entries.find((e) => !e.endedAt);
}

/** Determine if a timer is running for a specific task */
export function isTimerRunningForTask(activeEntry: TimeEntry | null, taskId: number): boolean {
  return activeEntry?.taskId === taskId && !activeEntry.endedAt;
}

/** Get the display name for a task in the timer bar */
export function getTimerTaskName(
  tasks: { id: number; name: string }[] | undefined,
  taskId: number,
): string {
  const task = tasks?.find((t) => String(t.id) === String(taskId));
  return task?.name ?? `Task #${taskId}`;
}
