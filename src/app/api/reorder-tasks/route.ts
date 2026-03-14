import { NextRequest } from 'next/server';
import { withAuthAndErrorHandling, createSuccessResponse, createErrorResponse, type AuthenticatedSession } from '@/shared/lib/api/route-wrapper';
import { DB } from '@/shared/lib/db';
import { and, eq, inArray } from 'drizzle-orm';
import { tasksTable } from '@/shared/lib/drizzle/schema';

type ReorderRequestBody = {
  taskIds: string[];
  context: {
    statusFilter: string;
    listId: number;
  };
};

async function reorderTasksHandler(req: NextRequest, session: AuthenticatedSession) {
  const { taskIds, context }: ReorderRequestBody = await req.json();

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    return createErrorResponse('taskIds must be a non-empty array', 400);
  }

  if (!context || !context.statusFilter || !context.listId) {
    return createErrorResponse('context with statusFilter and listId is required', 400);
  }

  const userTasks = await DB.select({ id: tasksTable.id })
    .from(tasksTable)
    .where(
      and(
        eq(tasksTable.userId, session.user.id),
        inArray(tasksTable.id, taskIds.map(id => parseInt(id)))
      )
    );

  if (userTasks.length !== taskIds.length) {
    return createErrorResponse('Some tasks do not belong to the authenticated user', 403);
  }

  await DB.transaction(async (tx) => {
    for (let i = 0; i < taskIds.length; i++) {
      await tx
        .update(tasksTable)
        .set({ sortOrder: i })
        .where(
          and(
            eq(tasksTable.id, parseInt(taskIds[i])),
            eq(tasksTable.userId, session.user.id)
          )
        );
    }
  });

  const updatedTasks = await DB.select()
    .from(tasksTable)
    .where(
      and(
        eq(tasksTable.userId, session.user.id),
        inArray(tasksTable.id, taskIds.map(id => parseInt(id)))
      )
    );

  return createSuccessResponse({
    success: true,
    tasks: updatedTasks,
    message: `Successfully reordered ${taskIds.length} tasks`
  });
}

export const POST = withAuthAndErrorHandling(reorderTasksHandler, 'reorder-tasks');
