import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '../user-auth';
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

export async function PUT(req: NextRequest) {
  try {
    const session = await validateUserSession();
    const { taskIds, context }: ReorderRequestBody = await req.json();

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { error: 'taskIds must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!context || !context.statusFilter || !context.listId) {
      return NextResponse.json(
        { error: 'context with statusFilter and listId is required' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'Some tasks do not belong to the authenticated user' },
        { status: 403 }
      );
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

    return NextResponse.json(
      {
        success: true,
        tasks: updatedTasks,
        message: `Successfully reordered ${taskIds.length} tasks`
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error reordering tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}