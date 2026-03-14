import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq, isNull } from 'drizzle-orm';
import { tasksTable, listsTable } from '@/shared/lib/drizzle/schema';
import { parseDateFields, TaskDateKeys } from '@/shared/lib/utils';
import dayjs from 'dayjs';
import { withApiAuth } from '@/shared/lib/api/api-route-wrapper';
import { serializeTaskWithDescription } from '../serialize';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/tasks/:id - Get a single task by ID
 */
export function GET(req: NextRequest, context: RouteContext) {
  return withApiAuth(async (_r, userId) => {
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
  }, 'GET /api/tasks/:id')(req);
}

/**
 * PATCH /api/tasks/:id - Update a task (partial update)
 *
 * Body: Partial task fields to update
 * Returns: Updated task
 */
export function PATCH(req: NextRequest, context: RouteContext) {
  return withApiAuth(async (r, userId) => {
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

    const body = await r.json();

    const ALLOWED_FIELDS = [
      'name', 'details', 'date', 'estimatedDuration', 'completedAt',
      'listId', 'isBlocker', 'selectedAt', 'deletedAt', 'sortOrder',
      'aiSuggestions', 'goalId',
    ] as const;

    const updateFields: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) {
        updateFields[field] = body[field];
      }
    }
    updateFields.updatedAt = new Date();

    const fieldsWithParsedDates = parseDateFields(updateFields, TaskDateKeys);

    await DB.update(tasksTable)
      .set(fieldsWithParsedDates as Partial<typeof tasksTable.$inferInsert>)
      .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, userId)));

    const [updatedRow] = await DB.select({
      task: tasksTable,
      listDescription: listsTable.description,
    })
      .from(tasksTable)
      .leftJoin(listsTable, eq(tasksTable.listId, listsTable.id))
      .where(and(eq(tasksTable.id, taskId), eq(tasksTable.userId, userId)));

    return NextResponse.json({ task: serializeTaskWithDescription(updatedRow.task, updatedRow.listDescription) }, { status: 200 });
  }, 'PATCH /api/tasks/:id')(req);
}

/**
 * DELETE /api/tasks/:id - Soft delete a task
 *
 * Query params:
 *   - permanent=true: Hard delete (permanent removal)
 *
 * Returns: Success message
 */
export function DELETE(req: NextRequest, context: RouteContext) {
  return withApiAuth(async (r, userId) => {
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

    const { searchParams } = new URL(r.url);
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
  }, 'DELETE /api/tasks/:id')(req);
}
