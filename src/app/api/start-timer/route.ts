import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { timeEntriesTable } from '@/shared/lib/drizzle/schema';
import dayjs from 'dayjs';
import { stopRunningTimers } from '../timer-helpers';

// POST - start a timer (creates a new open time entry, auto-stops any running one)
export async function POST(req: NextRequest) {
  const session = await validateUserSession();
  const { taskId } = await req.json();

  if (!taskId) {
    return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
  }

  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

  // Auto-stop any running timer for this user
  await stopRunningTimers(session.user.id);

  // Create a new open entry
  const [{ id }] = await DB.insert(timeEntriesTable).values({
    taskId: Number(taskId),
    userId: session.user.id,
    startedAt: new Date(now),
  }).$returningId();

  const [created] = await DB.select()
    .from(timeEntriesTable)
    .where(eq(timeEntriesTable.id, id));

  return NextResponse.json(created, { status: 200 });
}
