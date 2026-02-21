import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq, isNull } from 'drizzle-orm';
import { goalsTable, listsTable } from '@/shared/lib/drizzle/schema';
import { getUserIdFromApiKey } from '@/app/api/api-auth';
import { serializeGoalWithList, handleApiError } from './serialize';

/**
 * GET /api/goals - List goals
 *
 * Query params:
 *   - listId: Filter by list ID
 *   - includeDeleted: Include soft-deleted goals (default: false)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromApiKey(req);
    const { searchParams } = new URL(req.url);

    const listIdParam = searchParams.get('listId');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';

    const conditions = [eq(goalsTable.userId, userId)];

    if (!includeDeleted) {
      conditions.push(isNull(goalsTable.deletedAt));
    }

    if (listIdParam) {
      const listId = parseInt(listIdParam, 10);
      if (!isNaN(listId)) {
        conditions.push(eq(goalsTable.listId, listId));
      }
    }

    const rows = await DB.select({
      goal: goalsTable,
      listName: listsTable.name,
    })
      .from(goalsTable)
      .leftJoin(listsTable, eq(goalsTable.listId, listsTable.id))
      .where(and(...conditions));

    const goals = rows.map((r) => serializeGoalWithList(r.goal, r.listName));

    return NextResponse.json({ goals }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'GET /api/goals');
  }
}

/**
 * POST /api/goals - Create a new goal
 *
 * Body: { title: string, listId: number, description?: string, progress?: number }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromApiKey(req);
    const body = await req.json();

    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json({ error: 'Goal title is required' }, { status: 400 });
    }

    if (!body.listId || typeof body.listId !== 'number') {
      return NextResponse.json({ error: 'Goal listId is required (number)' }, { status: 400 });
    }

    // Verify list belongs to user
    const [list] = await DB.select()
      .from(listsTable)
      .where(and(eq(listsTable.id, body.listId), eq(listsTable.userId, userId)));

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    const { id: _id, userId: _userId, ...goalFields } = body;

    const [{ id }] = await DB.insert(goalsTable)
      .values({
        title: goalFields.title.trim(),
        description: goalFields.description ?? null,
        progress: goalFields.progress ?? 0,
        listId: goalFields.listId,
        __list_deprecated: '',
        userId,
      })
      .$returningId();

    const [row] = await DB.select({
      goal: goalsTable,
      listName: listsTable.name,
    })
      .from(goalsTable)
      .leftJoin(listsTable, eq(goalsTable.listId, listsTable.id))
      .where(eq(goalsTable.id, id));

    return NextResponse.json({ goal: serializeGoalWithList(row.goal, row.listName) }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST /api/goals');
  }
}
