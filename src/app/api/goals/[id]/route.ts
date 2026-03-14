import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq, isNull } from 'drizzle-orm';
import { goalsTable, listsTable } from '@/shared/lib/drizzle/schema';
import { withApiAuth } from '@/shared/lib/api/api-route-wrapper';
import { serializeGoalWithList } from '../serialize';
import dayjs from 'dayjs';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/goals/:id - Get a single goal by ID
 */
export function GET(req: NextRequest, context: RouteContext) {
  return withApiAuth(async (r, userId) => {
    const { id } = await context.params;
    const goalId = parseInt(id, 10);

    if (isNaN(goalId)) {
      return NextResponse.json({ error: 'Invalid goal ID' }, { status: 400 });
    }

    const [row] = await DB.select({
      goal: goalsTable,
      listName: listsTable.name,
    })
      .from(goalsTable)
      .leftJoin(listsTable, eq(goalsTable.listId, listsTable.id))
      .where(
        and(
          eq(goalsTable.id, goalId),
          eq(goalsTable.userId, userId),
          isNull(goalsTable.deletedAt)
        )
      );

    if (!row) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ goal: serializeGoalWithList(row.goal, row.listName) }, { status: 200 });
  }, 'GET /api/goals/:id')(req);
}

/**
 * PATCH /api/goals/:id - Update a goal (partial update)
 *
 * Body: Partial goal fields (title, description, progress, listId)
 */
export function PATCH(req: NextRequest, context: RouteContext) {
  return withApiAuth(async (r, userId) => {
    const { id } = await context.params;
    const goalId = parseInt(id, 10);

    if (isNaN(goalId)) {
      return NextResponse.json({ error: 'Invalid goal ID' }, { status: 400 });
    }

    const [existing] = await DB.select()
      .from(goalsTable)
      .where(
        and(
          eq(goalsTable.id, goalId),
          eq(goalsTable.userId, userId),
          isNull(goalsTable.deletedAt)
        )
      );

    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const body = await r.json();

    const updateFields: {
      title?: string;
      description?: string;
      progress?: number;
      listId?: number;
      deletedAt?: Date | null;
    } = {};

    if (body.title !== undefined) updateFields.title = body.title;
    if (body.description !== undefined) updateFields.description = body.description;
    if (body.progress !== undefined) updateFields.progress = body.progress;
    if (body.listId !== undefined) updateFields.listId = body.listId;
    if (body.deletedAt !== undefined) {
      updateFields.deletedAt = body.deletedAt ? new Date(body.deletedAt) : null;
    }

    if (updateFields.listId !== undefined) {
      const [list] = await DB.select()
        .from(listsTable)
        .where(and(eq(listsTable.id, updateFields.listId), eq(listsTable.userId, userId)));

      if (!list) {
        return NextResponse.json({ error: 'List not found' }, { status: 404 });
      }
    }

    await DB.update(goalsTable)
      .set(updateFields)
      .where(and(eq(goalsTable.id, goalId), eq(goalsTable.userId, userId)));

    const [updatedRow] = await DB.select({
      goal: goalsTable,
      listName: listsTable.name,
    })
      .from(goalsTable)
      .leftJoin(listsTable, eq(goalsTable.listId, listsTable.id))
      .where(and(eq(goalsTable.id, goalId), eq(goalsTable.userId, userId)));

    return NextResponse.json({ goal: serializeGoalWithList(updatedRow.goal, updatedRow.listName) }, { status: 200 });
  }, 'PATCH /api/goals/:id')(req);
}

/**
 * DELETE /api/goals/:id - Delete a goal
 *
 * Query params:
 *   - permanent=true: Hard delete (permanent removal)
 *   - Default: Soft delete (sets deletedAt)
 */
export function DELETE(req: NextRequest, context: RouteContext) {
  return withApiAuth(async (r, userId) => {
    const { id } = await context.params;
    const goalId = parseInt(id, 10);

    if (isNaN(goalId)) {
      return NextResponse.json({ error: 'Invalid goal ID' }, { status: 400 });
    }

    const [existing] = await DB.select()
      .from(goalsTable)
      .where(
        and(
          eq(goalsTable.id, goalId),
          eq(goalsTable.userId, userId)
        )
      );

    if (!existing) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const { searchParams } = new URL(r.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      await DB.delete(goalsTable)
        .where(and(eq(goalsTable.id, goalId), eq(goalsTable.userId, userId)));

      return NextResponse.json({ message: 'Goal permanently deleted' }, { status: 200 });
    } else {
      await DB.update(goalsTable)
        .set({ deletedAt: dayjs().toDate() })
        .where(and(eq(goalsTable.id, goalId), eq(goalsTable.userId, userId)));

      return NextResponse.json({ message: 'Goal deleted' }, { status: 200 });
    }
  }, 'DELETE /api/goals/:id')(req);
}
