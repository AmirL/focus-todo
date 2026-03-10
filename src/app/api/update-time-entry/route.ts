import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { timeEntriesTable } from '@/shared/lib/drizzle/schema';
import dayjs from 'dayjs';

// POST - update a time entry (edit start/end times)
export async function POST(req: NextRequest) {
  const session = await validateUserSession();
  const { id, startedAt, endedAt } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const [existing] = await DB.select()
    .from(timeEntriesTable)
    .where(and(eq(timeEntriesTable.id, id), eq(timeEntriesTable.userId, session.user.id)));

  if (!existing) {
    return NextResponse.json({ error: 'Time entry not found' }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};

  if (startedAt) {
    updateData.startedAt = new Date(startedAt);
  }
  if (endedAt) {
    updateData.endedAt = new Date(endedAt);
  }

  const finalStart = startedAt ? dayjs(startedAt) : dayjs(existing.startedAt);
  const finalEnd = endedAt ? dayjs(endedAt) : existing.endedAt ? dayjs(existing.endedAt) : null;

  if (finalEnd) {
    updateData.durationMinutes = Math.max(Math.round(finalEnd.diff(finalStart, 'minute', true)), 1);
  }

  await DB.update(timeEntriesTable)
    .set(updateData)
    .where(and(eq(timeEntriesTable.id, id), eq(timeEntriesTable.userId, session.user.id)));

  const [updated] = await DB.select()
    .from(timeEntriesTable)
    .where(eq(timeEntriesTable.id, id));

  return NextResponse.json(updated, { status: 200 });
}
