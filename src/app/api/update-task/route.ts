import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { tasksTable } from '@/shared/lib/drizzle/schema';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';
import { withAuthAndErrorHandling, createSuccessResponse, createErrorResponse } from '@/shared/lib/api/route-wrapper';

const allowedFields = [
  'name', 'details', 'date', 'estimatedDuration', 'completedAt',
  'listId', 'isBlocker', 'selectedAt', 'deletedAt', 'sortOrder',
  'aiSuggestions', 'goalId',
] as const;

async function updateTaskHandler(req: NextRequest, session: { user: { id: string } }) {
  const { id, task } = await req.json();

  const updateFields: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (task[field] !== undefined) {
      updateFields[field] = task[field];
    }
  }

  const taskWithParsedDates = parseDateFields(updateFields, TaskDateKeys);

  await DB.update(tasksTable)
    .set(taskWithParsedDates)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, session.user.id)));

  const [updatedTask] = await DB.select()
    .from(tasksTable)
    .where(and(eq(tasksTable.id, id), eq(tasksTable.userId, session.user.id)));

  if (!updatedTask) {
    return createErrorResponse('Task not found', 404);
  }

  return createSuccessResponse(updatedTask);
}

export const POST = withAuthAndErrorHandling(updateTaskHandler, 'update-task');
