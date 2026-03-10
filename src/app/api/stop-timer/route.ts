import { NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { and, eq, isNull } from 'drizzle-orm';
import { timeEntriesTable } from '@/shared/lib/drizzle/schema';
import dayjs from 'dayjs';

// POST - stop the currently running timer
export async function POST() {
  const session = await validateUserSession();
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  const [running] = await DB.select()
    .from(timeEntriesTable)
    .where(and(
      eq(timeEntriesTable.userId, session.user.id),
      isNull(timeEntriesTable.endedAt)
    ));

  if (!running) {
    return NextResponse.json({ error: 'No running timer' }, { status: 404 });
  }

  const startedAt = dayjs(running.startedAt);
  const duration = Math.round(dayjs(now).diff(startedAt, 'minute', true));

  await DB.update(timeEntriesTable)
    .set({ endedAt: new Date(now), durationMinutes: Math.max(duration, 1) })
    .where(eq(timeEntriesTable.id, running.id));

  const [stopped] = await DB.select()
    .from(timeEntriesTable)
    .where(eq(timeEntriesTable.id, running.id));

  return NextResponse.json(stopped, { status: 200 });
}
