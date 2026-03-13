import { NextRequest } from 'next/server';
import {
  withAuthAndErrorHandling,
  createSuccessResponse,
  createErrorResponse,
} from '@/shared/lib/api/route-wrapper';
import { DB } from '@/shared/lib/db';
import { and, eq, isNull, or } from 'drizzle-orm';
import { currentInitiativeTable, listsTable } from '@/shared/lib/drizzle/schema';
import { calculateBalance, type ListWithLastTouched } from '@/entities/current-initiative';
import { toDate, formatDate, getParticipatingLists, fetchBalanceAndSuggestion } from '@/shared/lib/api/initiative-helpers';
import dayjs from '@/shared/lib/dayjs';

type InitiativeRow = typeof currentInitiativeTable.$inferSelect;
type ListRow = typeof listsTable.$inferSelect;

interface InitiativeResponse {
  today: InitiativeRow | null;
  tomorrow: InitiativeRow | null;
  suggestedList: ListWithLastTouched | null;
  balance: ReturnType<typeof calculateBalance>;
  participatingLists: ListRow[];
}

/**
 * GET /api/current-initiative
 * Returns today's and tomorrow's initiative, plus balance data and suggestion
 */
async function getInitiativeHandler(
  _req: NextRequest,
  session: { user: { id: string } }
) {
  const userId = session.user.id;
  const todayStr = dayjs().format('YYYY-MM-DD');
  const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const todayDate = toDate(todayStr);
  const tomorrowDate = toDate(tomorrowStr);

  // Get all non-archived participating lists for this user
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

  const todayInitiative = initiatives.find((i) => formatDate(i.date) === todayStr) ?? null;
  const tomorrowInitiative = initiatives.find((i) => formatDate(i.date) === tomorrowStr) ?? null;

  // Calculate balance and suggestion
  const { balance, suggestedList: suggested } = await fetchBalanceAndSuggestion(userId, participatingLists);

  // Only include suggestion if not both days are already set
  const suggestedList: ListWithLastTouched | null =
    (!tomorrowInitiative || !todayInitiative) ? suggested : null;

  const response: InitiativeResponse = {
    today: todayInitiative,
    tomorrow: tomorrowInitiative,
    suggestedList,
    balance,
    participatingLists,
  };

  return createSuccessResponse(response, 200);
}

interface SetInitiativeBody {
  listId: number;
  date?: string; // YYYY-MM-DD, defaults to tomorrow
  reason?: string;
}

/**
 * POST /api/current-initiative
 * Set tomorrow's focus. Creates a new initiative record for tomorrow.
 */
async function createInitiativeHandler(
  req: NextRequest,
  session: { user: { id: string } }
) {
  const userId = session.user.id;

  const body: SetInitiativeBody = await req.json();

  if (!body.listId) {
    return createErrorResponse('listId is required', 400);
  }

  // Determine target date: use provided date or default to tomorrow
  const todayStr = dayjs().format('YYYY-MM-DD');
  const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');

  if (body.date) {
    const isValid = /^\d{4}-\d{2}-\d{2}$/.test(body.date) && dayjs(body.date, 'YYYY-MM-DD', true).isValid();
    if (!isValid) {
      return createErrorResponse('Invalid date format. Use YYYY-MM-DD', 400);
    }
    if (body.date !== todayStr && body.date !== tomorrowStr) {
      return createErrorResponse('Can only set initiative for today or tomorrow', 400);
    }
  }

  const targetDateStr = body.date ?? tomorrowStr;
  const targetDate = toDate(targetDateStr);

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
    return createErrorResponse('List not found', 404);
  }

  // Check if initiative already exists for target date
  const [existing] = await DB.select()
    .from(currentInitiativeTable)
    .where(
      and(
        eq(currentInitiativeTable.userId, userId),
        eq(currentInitiativeTable.date, targetDate)
      )
    );

  if (existing) {
    return createErrorResponse('Initiative for this date already exists. Use PATCH to change it.', 409);
  }

  // Calculate the suggested list to store what the system would have suggested
  const lists = await DB.select()
    .from(listsTable)
    .where(
      and(
        eq(listsTable.userId, userId),
        eq(listsTable.participatesInInitiative, true),
        isNull(listsTable.archivedAt)
      )
    );

  // Calculate suggestion using shared balance pipeline
  const { suggestedList: suggested } = await fetchBalanceAndSuggestion(userId, lists);
  const suggestedListId = suggested?.id ?? null;

  // If user chose the suggested list, store it as suggested only (chosenListId = null)
  // If user chose a different list, store both suggested and chosen
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

  // Fetch the created record
  const [created] = await DB.select()
    .from(currentInitiativeTable)
    .where(eq(currentInitiativeTable.id, inserted.id));

  return createSuccessResponse({ initiative: created }, 201);
}

export const GET = withAuthAndErrorHandling(getInitiativeHandler, 'GET /api/current-initiative');
export const POST = withAuthAndErrorHandling(createInitiativeHandler, 'POST /api/current-initiative');
