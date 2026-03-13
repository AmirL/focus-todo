import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/shared/lib/db';
import { and, eq, isNull, or } from 'drizzle-orm';
import { currentInitiativeTable, listsTable } from '@/shared/lib/drizzle/schema';
import { authenticateApiKey } from '@/app/api/api-auth';
import { type ListWithLastTouched } from '@/entities/current-initiative';
import { serializeInitiative, handleApiError } from './serialize';
import { toDate, formatDateKey, getParticipatingLists, fetchBalanceAndSuggestion } from '@/shared/lib/api/initiative-helpers';
import dayjs from '@/shared/lib/dayjs';

/**
 * GET /api/initiative - Get today's and tomorrow's initiative with balance data
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await authenticateApiKey(req);
    const todayStr = dayjs().format('YYYY-MM-DD');
    const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');
    const todayDate = toDate(todayStr);
    const tomorrowDate = toDate(tomorrowStr);

    // Get all non-archived participating lists
    const lists = await DB.select()
      .from(listsTable)
      .where(and(eq(listsTable.userId, userId), isNull(listsTable.archivedAt)));

    const participatingLists = getParticipatingLists(lists);

    // Get today's and tomorrow's initiatives
    const initiatives = await DB.select()
      .from(currentInitiativeTable)
      .where(
        and(
          eq(currentInitiativeTable.userId, userId),
          or(
            eq(currentInitiativeTable.date, todayDate),
            eq(currentInitiativeTable.date, tomorrowDate)
          )
        )
      );

    const todayInitiative = initiatives.find((i) => formatDateKey(i.date) === todayStr) ?? null;
    const tomorrowInitiative = initiatives.find((i) => formatDateKey(i.date) === tomorrowStr) ?? null;

    // Calculate balance and suggestion
    const { balance, suggestedList: suggested } = await fetchBalanceAndSuggestion(userId, participatingLists);

    // Only include suggestion if not both days are already set
    const suggestedList: ListWithLastTouched | null =
      (!tomorrowInitiative || !todayInitiative) ? suggested : null;

    return NextResponse.json(
      {
        today: todayInitiative ? serializeInitiative(todayInitiative) : null,
        tomorrow: tomorrowInitiative ? serializeInitiative(tomorrowInitiative) : null,
        suggestedList,
        balance,
        participatingLists: lists.map((l) => ({
          id: l.id,
          name: l.name,
          participatesInInitiative: l.participatesInInitiative,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'GET /api/initiative');
  }
}

/**
 * POST /api/initiative - Set focus for a date
 *
 * Body: { listId: number, date?: string (YYYY-MM-DD), reason?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await authenticateApiKey(req);
    const body = await req.json() as Record<string, unknown>;

    if (!body.listId || typeof body.listId !== 'number' || !Number.isFinite(body.listId)) {
      return NextResponse.json({ error: 'listId must be a valid number' }, { status: 400 });
    }

    if (body.date !== undefined && typeof body.date !== 'string') {
      return NextResponse.json({ error: 'date must be a string in YYYY-MM-DD format' }, { status: 400 });
    }

    if (body.reason !== undefined && typeof body.reason !== 'string') {
      return NextResponse.json({ error: 'reason must be a string' }, { status: 400 });
    }

    const todayStr = dayjs().format('YYYY-MM-DD');
    const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');

    if (body.date) {
      const isValid = /^\d{4}-\d{2}-\d{2}$/.test(body.date) && dayjs(body.date, 'YYYY-MM-DD', true).isValid();
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
      }
      if (body.date !== todayStr && body.date !== tomorrowStr) {
        return NextResponse.json({ error: 'Can only set initiative for today or tomorrow' }, { status: 400 });
      }
    }

    const targetDateStr = body.date ?? tomorrowStr;
    const targetDate = toDate(targetDateStr);

    // Verify list belongs to user
    const [list] = await DB.select()
      .from(listsTable)
      .where(and(eq(listsTable.id, body.listId), eq(listsTable.userId, userId)));

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    // Check if initiative already exists
    const [existing] = await DB.select()
      .from(currentInitiativeTable)
      .where(
        and(
          eq(currentInitiativeTable.userId, userId),
          eq(currentInitiativeTable.date, targetDate)
        )
      );

    if (existing) {
      return NextResponse.json(
        { error: 'Initiative for this date already exists. Use PATCH to change it.' },
        { status: 409 }
      );
    }

    // Calculate suggested list
    const allLists = await DB.select()
      .from(listsTable)
      .where(
        and(
          eq(listsTable.userId, userId),
          eq(listsTable.participatesInInitiative, true),
          isNull(listsTable.archivedAt)
        )
      );

    // Calculate suggestion using shared balance pipeline
    const { suggestedList: suggested } = await fetchBalanceAndSuggestion(userId, allLists);
    const suggestedListId = suggested?.id ?? null;
    const chosenListId = body.listId === suggestedListId ? null : body.listId;

    const [inserted] = await DB.insert(currentInitiativeTable)
      .values({
        userId,
        date: targetDate,
        suggestedListId,
        chosenListId,
        reason: body.reason ?? null,
        setAt: new Date(),
      })
      .$returningId();

    const [created] = await DB.select()
      .from(currentInitiativeTable)
      .where(eq(currentInitiativeTable.id, inserted.id));

    return NextResponse.json({ initiative: serializeInitiative(created) }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'POST /api/initiative');
  }
}
