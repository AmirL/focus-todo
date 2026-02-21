import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { currentInitiativeTable, listsTable } from '@/shared/lib/drizzle/schema';
import { getUserIdFromApiKey } from '@/app/api/api-auth';
import { serializeInitiative, handleApiError } from '../serialize';
import dayjs from 'dayjs';

type RouteContext = { params: Promise<{ date: string }> };

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && dayjs(dateStr, 'YYYY-MM-DD', true).isValid();
}

function toDate(dateStr: string): Date {
  return dayjs(dateStr).toDate();
}

/**
 * GET /api/initiative/:date - Get initiative for a specific date
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserIdFromApiKey(req);
    const { date } = await context.params;

    if (!isValidDate(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    const dateObj = toDate(date);

    const [initiative] = await DB.select()
      .from(currentInitiativeTable)
      .where(
        and(
          eq(currentInitiativeTable.userId, userId),
          eq(currentInitiativeTable.date, dateObj)
        )
      );

    if (!initiative) {
      return NextResponse.json({ error: 'No initiative found for this date' }, { status: 404 });
    }

    return NextResponse.json({ initiative: serializeInitiative(initiative) }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'GET /api/initiative/:date');
  }
}

/**
 * PATCH /api/initiative/:date - Change focus for a specific date
 *
 * Body: { listId: number, reason?: string }
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const userId = await getUserIdFromApiKey(req);
    const { date } = await context.params;

    if (!isValidDate(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    const body = await req.json();

    if (!body.listId) {
      return NextResponse.json({ error: 'listId is required' }, { status: 400 });
    }

    // Verify list belongs to user
    const [list] = await DB.select()
      .from(listsTable)
      .where(and(eq(listsTable.id, body.listId), eq(listsTable.userId, userId)));

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    const dateObj = toDate(date);

    // Find existing initiative
    const [existing] = await DB.select()
      .from(currentInitiativeTable)
      .where(
        and(
          eq(currentInitiativeTable.userId, userId),
          eq(currentInitiativeTable.date, dateObj)
        )
      );

    if (!existing) {
      return NextResponse.json(
        { error: 'No initiative found for this date. Use POST to create one.' },
        { status: 404 }
      );
    }

    // Update
    await DB.update(currentInitiativeTable)
      .set({
        chosenListId: body.listId,
        reason: body.reason ?? existing.reason,
        changedAt: new Date(),
      })
      .where(
        and(
          eq(currentInitiativeTable.userId, userId),
          eq(currentInitiativeTable.date, dateObj)
        )
      );

    const [updated] = await DB.select()
      .from(currentInitiativeTable)
      .where(
        and(
          eq(currentInitiativeTable.userId, userId),
          eq(currentInitiativeTable.date, dateObj)
        )
      );

    return NextResponse.json({ initiative: serializeInitiative(updated) }, { status: 200 });
  } catch (error) {
    return handleApiError(error, 'PATCH /api/initiative/:date');
  }
}
