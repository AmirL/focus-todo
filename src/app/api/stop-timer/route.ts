import { NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { and, eq, isNull } from 'drizzle-orm';
import { timeEntriesTable } from '@/shared/lib/drizzle/schema';
import { stopRunningTimers } from '../timer-helpers';

// POST - stop the currently running timer
export async function POST() {
  const session = await validateUserSession();

  const [running] = await DB.select()
    .from(timeEntriesTable)
    .where(and(
      eq(timeEntriesTable.userId, session.user.id),
      isNull(timeEntriesTable.endedAt)
    ));

  if (!running) {
    return NextResponse.json({ error: 'No running timer' }, { status: 404 });
  }

  await stopRunningTimers(session.user.id);

  const [stopped] = await DB.select()
    .from(timeEntriesTable)
    .where(eq(timeEntriesTable.id, running.id));

  return NextResponse.json(stopped, { status: 200 });
}
