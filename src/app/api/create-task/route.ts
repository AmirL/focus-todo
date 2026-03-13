import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { tasksTable } from '@/shared/lib/drizzle/schema';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';
import { withAuthAndErrorHandling, createSuccessResponse, createErrorResponse } from '@/shared/lib/api/route-wrapper';

async function createTaskHandler(req: NextRequest, session: { user: { id: string } }) {
  const { task } = await req.json();

  if (!task?.name || typeof task.name !== 'string' || task.name.trim() === '') {
    return createErrorResponse('Task name is required');
  }

  if (!task?.listId || typeof task.listId !== 'number') {
    return createErrorResponse('Task listId is required (number)');
  }

  const taskWithParsedDates = parseDateFields({
    ...task,
    __list_deprecated: '',
    createdAt: undefined,
    id: undefined,
    userId: session.user.id
  }, TaskDateKeys);

  const [{ id }] = await DB.insert(tasksTable).values(taskWithParsedDates).$returningId();
  const [createdTask] = await DB.select().from(tasksTable).where(eq(tasksTable.id, id));

  return createSuccessResponse(createdTask);
}

export const POST = withAuthAndErrorHandling(createTaskHandler, 'create-task');
