import { NextRequest } from 'next/server';
import { DB } from '@/shared/lib/db';
import { eq } from 'drizzle-orm';
import { tasksTable } from '@/shared/lib/drizzle/schema';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';
import { withAuthAndErrorHandling, createSuccessResponse } from '@/shared/lib/api/route-wrapper';

async function createTaskHandler(req: NextRequest, session: { user: { id: string } }) {
  const { task } = await req.json();

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
