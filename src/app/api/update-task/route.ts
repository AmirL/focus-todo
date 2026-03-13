import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { tasksTable } from '@/shared/lib/drizzle/schema';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';
import { withAuthAndErrorHandling, createSuccessResponse } from '@/shared/lib/api/route-wrapper';

async function updateTaskHandler(req: NextRequest, session: { user: { id: string } }) {
  const { id, task } = await req.json();

  const taskWithParsedDates = parseDateFields({ ...task, createdAt: undefined }, TaskDateKeys);

  await DB.update(tasksTable)
    .set(taskWithParsedDates)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, session.user.id)));

  const [updatedTask] = await DB.select()
    .from(tasksTable)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, session.user.id)));

  return createSuccessResponse(updatedTask);
}

export const POST = withAuthAndErrorHandling(updateTaskHandler, 'update-task');
