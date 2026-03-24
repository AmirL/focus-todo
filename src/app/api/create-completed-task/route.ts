import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { tasksTable, timeEntriesTable } from '@/shared/lib/drizzle/schema';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';
import dayjs from 'dayjs';
import { withAuthAndErrorHandling, createErrorResponse, createSuccessResponse } from '@/shared/lib/api/route-wrapper';

async function createCompletedTaskHandler(req: NextRequest, session: { user: { id: string } }) {
  const { task, taskId, startedAt, endedAt } = await req.json();

  // Either an existing taskId or a new task definition is required
  if (!taskId && (!task?.name || !task?.listId)) {
    return createErrorResponse('Either taskId or task.name+task.listId are required', 400);
  }
  if (!startedAt || !endedAt) {
    return createErrorResponse('startedAt and endedAt are required', 400);
  }

  const start = dayjs(startedAt);
  const end = dayjs(endedAt);
  if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
    return createErrorResponse('Invalid time range', 400);
  }

  const durationMinutes = Math.max(Math.round(end.diff(start, 'minute', true)), 1);

  let resolvedTaskId: number;

  if (taskId) {
    // Log time against an existing task
    const [existingTask] = await DB.select()
      .from(tasksTable)
      .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, session.user.id)));
    if (!existingTask) {
      return createErrorResponse('Task not found', 404);
    }
    resolvedTaskId = taskId;
  } else {
    // Create a new completed task
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

    const [{ id }] = await DB.insert(tasksTable).values(taskWithParsedDates).$returningId();
    resolvedTaskId = id;
  }

  const [{ id: timeEntryId }] = await DB.insert(timeEntriesTable).values({
    taskId: resolvedTaskId,
    userId: session.user.id,
    startedAt: new Date(startedAt),
    endedAt: new Date(endedAt),
    durationMinutes,
  }).$returningId();

  const [returnedTask] = await DB.select().from(tasksTable).where(eq(tasksTable.id, resolvedTaskId));
  const [createdTimeEntry] = await DB.select().from(timeEntriesTable).where(eq(timeEntriesTable.id, timeEntryId));

  return createSuccessResponse({ task: returnedTask, timeEntry: createdTimeEntry });
}

export const POST = withAuthAndErrorHandling(createCompletedTaskHandler, 'create-completed-task');
