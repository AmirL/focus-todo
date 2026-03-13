import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq, isNull } from 'drizzle-orm';
import { tasksTable, listsTable } from '@/shared/lib/drizzle/schema';
import { getUserIdFromApiKey } from '@/app/api/api-auth';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';
import dayjs from 'dayjs';
import { serializeTaskWithDescription, handleApiError } from '../serialize';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/tasks/:id - Get a single task by ID
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserIdFromApiKey(req);
    const { id } = await context.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    const [row] = await DB.select({
      task: tasksTable,
      listDescription: listsTable.description,
    })
      .from(tasksTable)
      .leftJoin(listsTable, eq(tasksTable.listId, listsTable.id))
      .where(
        and(
          eq(tasksTable.id, taskId),
          eq(tasksTable.userId, userId),
          isNull(tasksTable.deletedAt)
        )
      );

    if (!row) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task: serializeTaskWithDescription(row.task, row.listDescription) }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'GET /api/tasks/:id');
  }
}

/**
 * PATCH /api/tasks/:id - Update a task (partial update)
 *
 * Body: Partial task fields to update
 * Returns: Updated task
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserIdFromApiKey(req);
    const { id } = await context.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // Check if task exists and belongs to user
    const [existingTask] = await DB.select()
      .from(tasksTable)
      .where(
        and(
          eq(tasksTable.id, taskId),
          eq(tasksTable.userId, userId),
          isNull(tasksTable.deletedAt)
        )
      );

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const body = await req.json();

    // Remove fields that should not be updated via API
    const { id: _id, userId: _userId, createdAt: _createdAt, ...updateFields } = body;

    // Parse date fields
    const fieldsWithParsedDates = parseDateFields(
      { ...updateFields, updatedAt: new Date() },
      TaskDateKeys
    );

    await DB.update(tasksTable)
      .set(fieldsWithParsedDates)
      .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, userId)));

    const [updatedRow] = await DB.select({
      task: tasksTable,
      listDescription: listsTable.description,
    })
      .from(tasksTable)
      .leftJoin(listsTable, eq(tasksTable.listId, listsTable.id))
      .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, userId)));

    return NextResponse.json({ task: serializeTaskWithDescription(updatedRow.task, updatedRow.listDescription) }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'PATCH /api/tasks/:id');
  }
}

/**
 * DELETE /api/tasks/:id - Soft delete a task
 *
 * Query params:
 *   - permanent=true: Hard delete (permanent removal)
 *
 * Returns: Success message
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserIdFromApiKey(req);
    const { id } = await context.params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Invalid task ID' }, { status: 400 });
    }

    // Check if task exists and belongs to user
    const [existingTask] = await DB.select()
      .from(tasksTable)
      .where(
        and(
          eq(tasksTable.id, taskId),
          eq(tasksTable.userId, userId)
        )
      );

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      // Hard delete
      await DB.delete(tasksTable)
        .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, userId)));

      return NextResponse.json({ message: 'Task permanently deleted' }, { status: 200 });
    } else {
      // Soft delete
      await DB.update(tasksTable)
        .set({ deletedAt: dayjs().toDate(), updatedAt: new Date() })
        .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, userId)));

      return NextResponse.json({ message: 'Task deleted' }, { status: 200 });
    }
  } catch (error) {
    return handleApiError(error, 'DELETE /api/tasks/:id');
  }
}
