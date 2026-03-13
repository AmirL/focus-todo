import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { tasksTable, timeEntriesTable } from '@/shared/lib/drizzle/schema';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';
import dayjs from 'dayjs';

/**
 * Creates a completed task with a time entry for a specific time range.
 * Used for retroactively logging tasks from timeline gaps.
 *
 * Expects: { task: TaskPlain, startedAt: string, endedAt: string }
 * - task must include name, listId
 * - startedAt/endedAt are ISO datetime strings for the time entry
 */
export async function POST(req: NextRequest) {
  const session = await validateUserSession();

  const { task, startedAt, endedAt } = await req.json();

  if (!task?.name || !task?.listId) {
    return NextResponse.json({ error: 'task.name and task.listId are required' }, { status: 400 });
  }
  if (!startedAt || !endedAt) {
    return NextResponse.json({ error: 'startedAt and endedAt are required' }, { status: 400 });
  }

  const start = dayjs(startedAt);
  const end = dayjs(endedAt);
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    return NextResponse.json({ error: 'Invalid time range' }, { status: 400 });
  }

  const durationMinutes = Math.max(Math.round(end.diff(start, 'minute', true)), 1);

  // Create the task as completed
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
  const taskWithParsedDates = parseDateFields({
    ...task,
    __list_deprecated: '',
    completedAt: now,
    date: dayjs(startedAt).format('YYYY-MM-DD HH:mm:ss'),
    createdAt: undefined,
    id: undefined,
    userId: session.user.id,
  }, TaskDateKeys);

  const [{ id: taskId }] = await DB.insert(tasksTable).values(taskWithParsedDates).$returningId();

  // Create the time entry
  const [{ id: timeEntryId }] = await DB.insert(timeEntriesTable).values({
    taskId,
    userId: session.user.id,
    startedAt: new Date(startedAt),
    endedAt: new Date(endedAt),
    durationMinutes,
  }).$returningId();

  const [createdTask] = await DB.select().from(tasksTable).where(eq(tasksTable.id, taskId));
  const [createdTimeEntry] = await DB.select().from(timeEntriesTable).where(eq(timeEntriesTable.id, timeEntryId));

  return NextResponse.json({ task: createdTask, timeEntry: createdTimeEntry }, { status: 200 });
}
