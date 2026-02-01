import { NextRequest } from 'next/server';
import {
  withAuthAndErrorHandling,
  createSuccessResponse,
  createErrorResponse,
} from '@/shared/lib/api/route-wrapper';
import { DB } from '@/shared/lib/db';
import { and, eq, gte, lte, or } from 'drizzle-orm';
import { currentInitiativeTable, listsTable } from '@/shared/lib/drizzle/schema';
import { getSuggestedList, calculateBalance, type ListWithLastTouched } from '@/entities/current-initiative';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

// Helper to convert date string to Date object for DB queries
function toDate(dateStr: string): Date {
  return dayjs(dateStr).toDate();
}

// Helper to format Date to YYYY-MM-DD string
function formatDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

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
  req: NextRequest,
  session: { user: { id: string } }
) {
  const userId = session.user.id;
  const todayStr = dayjs().format('YYYY-MM-DD');
  const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const todayDate = toDate(todayStr);
  const tomorrowDate = toDate(tomorrowStr);

  // Get all participating lists for this user
  const lists = await DB.select()
    .from(listsTable)
    .where(eq(listsTable.userId, userId));

  const participatingLists = lists.filter((l) => l.participatesInInitiative);

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

  // Get last 30 days of initiatives for balance calculation
  const thirtyDaysAgoDate = toDate(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
  const recentInitiatives = await DB.select()
    .from(currentInitiativeTable)
    .where(
      and(
        eq(currentInitiativeTable.userId, userId),
        gte(currentInitiativeTable.date, thirtyDaysAgoDate),
        lte(currentInitiativeTable.date, todayDate)
      )
    );

  // Calculate balance
  const balance = calculateBalance(
    recentInitiatives.map((i) => ({
      id: i.id,
      userId: i.userId,
      date: formatDate(i.date),
      suggestedListId: i.suggestedListId,
      chosenListId: i.chosenListId,
      reason: i.reason,
      setAt: i.setAt,
      changedAt: i.changedAt,
      getEffectiveListId: () => i.chosenListId ?? i.suggestedListId,
      wasChanged: () => i.chosenListId !== null && i.chosenListId !== i.suggestedListId,
    })),
    participatingLists.map((l) => ({ id: l.id, name: l.name }))
  );

  // Get suggested list for tomorrow (if not already set)
  let suggestedList: ListWithLastTouched | null = null;
  if (!tomorrowInitiative) {
    // Build list with last touched info from initiatives
    const listsWithLastTouched: ListWithLastTouched[] = participatingLists.map((list) => {
      const listBalance = balance.find((b) => b.listId === list.id);
      return {
        id: list.id,
        name: list.name,
        participatesInInitiative: list.participatesInInitiative ?? true,
        lastTouchedAt: listBalance?.lastUsedDate ? new Date(listBalance.lastUsedDate) : null,
      };
    });
    suggestedList = getSuggestedList(listsWithLastTouched);
  }

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
  reason?: string;
}

/**
 * POST /api/current-initiative
 * Set tomorrow's focus. Creates a new initiative record for tomorrow.
 */
async function setInitiativeHandler(
  req: NextRequest,
  session: { user: { id: string } }
) {
  const userId = session.user.id;
  const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const tomorrowDate = toDate(tomorrowStr);

  const body: SetInitiativeBody = await req.json();

  if (!body.listId) {
    return createErrorResponse('listId is required', 400);
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
    return createErrorResponse('List not found', 404);
  }

  // Check if tomorrow's initiative already exists
  const [existing] = await DB.select()
    .from(currentInitiativeTable)
    .where(
      and(
        eq(currentInitiativeTable.userId, userId),
        eq(currentInitiativeTable.date, tomorrowDate)
      )
    );

  if (existing) {
    return createErrorResponse('Initiative for tomorrow already exists. Use PATCH to change it.', 409);
  }

  // Calculate the suggested list to store what the system would have suggested
  const lists = await DB.select()
    .from(listsTable)
    .where(
      and(
        eq(listsTable.userId, userId),
        eq(listsTable.participatesInInitiative, true)
      )
    );

  // Get recent initiatives to calculate suggestion
  const thirtyDaysAgoDate = toDate(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
  const todayDate = toDate(dayjs().format('YYYY-MM-DD'));
  const recentInitiatives = await DB.select()
    .from(currentInitiativeTable)
    .where(
      and(
        eq(currentInitiativeTable.userId, userId),
        gte(currentInitiativeTable.date, thirtyDaysAgoDate),
        lte(currentInitiativeTable.date, todayDate)
      )
    );

  const balance = calculateBalance(
    recentInitiatives.map((i) => ({
      id: i.id,
      userId: i.userId,
      date: formatDate(i.date),
      suggestedListId: i.suggestedListId,
      chosenListId: i.chosenListId,
      reason: i.reason,
      setAt: i.setAt,
      changedAt: i.changedAt,
      getEffectiveListId: () => i.chosenListId ?? i.suggestedListId,
      wasChanged: () => i.chosenListId !== null && i.chosenListId !== i.suggestedListId,
    })),
    lists.map((l) => ({ id: l.id, name: l.name }))
  );

  const listsWithLastTouched: ListWithLastTouched[] = lists.map((l) => {
    const listBalance = balance.find((b) => b.listId === l.id);
    return {
      id: l.id,
      name: l.name,
      participatesInInitiative: l.participatesInInitiative ?? true,
      lastTouchedAt: listBalance?.lastUsedDate ? new Date(listBalance.lastUsedDate) : null,
    };
  });

  const suggested = getSuggestedList(listsWithLastTouched);
  const suggestedListId = suggested?.id ?? null;

  // If user chose the suggested list, store it as suggested only (chosenListId = null)
  // If user chose a different list, store both suggested and chosen
  const chosenListId = body.listId === suggestedListId ? null : body.listId;

  const [inserted] = await DB.insert(currentInitiativeTable)
    .values({
      userId,
      date: tomorrowDate,
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
export const POST = withAuthAndErrorHandling(setInitiativeHandler, 'POST /api/current-initiative');
