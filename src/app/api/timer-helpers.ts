import { DB } from '@/shared/lib/db';
import { and, eq, isNull } from 'drizzle-orm';
import { timeEntriesTable } from '@/shared/lib/drizzle/schema';
import dayjs from 'dayjs';

/**
 * Stops all running timers for a given user.
 * Returns the number of entries stopped.
 */
export async function stopRunningTimers(userId: string): Promise<number> {
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  const runningEntries = await DB.select()
    .from(timeEntriesTable)
    .where(and(
      eq(timeEntriesTable.userId, userId),
      isNull(timeEntriesTable.endedAt)
    ));

  for (const entry of runningEntries) {
    const startedAt = dayjs(entry.startedAt);
    const duration = Math.round(dayjs(now).diff(startedAt, 'minute', true));
    await DB.update(timeEntriesTable)
      .set({ endedAt: new Date(now), durationMinutes: Math.max(duration, 1) })
      .where(eq(timeEntriesTable.id, entry.id));
  }

  return runningEntries.length;
}
