import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession } from '@/app/api/user-auth';
import { DB } from '@/shared/lib/db';
import { and, eq } from 'drizzle-orm';
import { currentInitiativeTable, listsTable } from '@/shared/lib/drizzle/schema';
import { toDate } from '@/shared/lib/api/initiative-helpers';
import dayjs from 'dayjs';

type RouteContext = { params: Promise<{ date: string }> };

function handleError(error: unknown, operation: string) {
  const msg = error instanceof Error ? error.message : 'Unknown error occurred';
  console.error(`Error in ${operation}:`, error);
  return NextResponse.json({ error: msg }, { status: 500 });
}

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && dayjs(dateStr, 'YYYY-MM-DD', true).isValid();
}

interface ChangeInitiativeBody {
  listId: number;
  reason?: string;
}

/**
 * PATCH /api/current-initiative/[date]
 * Change the focus for a specific day. Updates an existing initiative record.
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await validateUserSession();
    const userId = session.user.id;
    const { date } = await context.params;

    if (!isValidDate(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const body: ChangeInitiativeBody = await req.json();

    if (!body.listId) {
      return NextResponse.json(
        { error: 'listId is required' },
        { status: 400 }
      );
    }

    // Verify the list exists and belongs to the user
    const [list] = await DB.select()
      .from(listsTable)
      .where(
        and(
          eq(listsTable.id, body.listId),
          eq(listsTable.userId, userId)
        )
      );

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    const dateObj = toDate(date);

    // Find existing initiative for this date
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

    // Update the initiative with the new choice
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

    // Fetch the updated record
    const [updated] = await DB.select()
      .from(currentInitiativeTable)
      .where(
        and(
          eq(currentInitiativeTable.userId, userId),
          eq(currentInitiativeTable.date, dateObj)
        )
      );

    return NextResponse.json({ initiative: updated }, { status: 200 });
  } catch (error) {
    return handleError(error, 'PATCH /api/current-initiative/[date]');
  }
}

/**
 * GET /api/current-initiative/[date]
 * Get the initiative for a specific date
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const session = await validateUserSession();
    const userId = session.user.id;
    const { date } = await context.params;

    if (!isValidDate(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: 'No initiative found for this date' },
        { status: 404 }
      );
    }

    return NextResponse.json({ initiative }, { status: 200 });
  } catch (error) {
    return handleError(error, 'GET /api/current-initiative/[date]');
  }
}
