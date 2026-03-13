import dayjs from 'dayjs';
import { and, eq, gte, lte, desc, isNull, or } from 'drizzle-orm';
import { currentInitiativeTable, listsTable } from '@/shared/lib/drizzle/schema';
import { DB } from '@/shared/lib/db';
import { calculateBalance, getSuggestedList, type ListWithLastTouched } from '@/entities/current-initiative';

export type ListRow = typeof listsTable.$inferSelect;
type InitiativeRow = typeof currentInitiativeTable.$inferSelect;

/** Convert a YYYY-MM-DD string to a Date object for DB queries */
export function toDate(dateStr: string): Date {
  return dayjs(dateStr).toDate();
}

/** Validate that a date string is a valid YYYY-MM-DD format */
export function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && dayjs(dateStr, 'YYYY-MM-DD', true).isValid();
}

/** Format a Date to YYYY-MM-DD string */
function formatDateKey(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

/** Filter lists to only those participating in initiative */
function getParticipatingLists(lists: ListRow[]): ListRow[] {
  return lists.filter((l) => l.participatesInInitiative);
}

/** Map raw initiative DB rows to the shape expected by calculateBalance */
function toBalanceEntries(initiatives: InitiativeRow[]) {
  return initiatives.map((i) => ({
    id: i.id,
    userId: i.userId,
    date: formatDateKey(i.date),
    suggestedListId: i.suggestedListId,
    chosenListId: i.chosenListId,
    reason: i.reason,
    setAt: i.setAt,
    changedAt: i.changedAt,
    getEffectiveListId: () => i.chosenListId ?? i.suggestedListId,
    wasChanged: () => i.chosenListId !== null && i.chosenListId !== i.suggestedListId,
  }));
}

/** Fetch recent initiatives and compute balance + suggested list for a user */
async function fetchBalanceAndSuggestion(
  userId: string,
  participatingLists: ListRow[]
) {
  const todayStr = dayjs().format('YYYY-MM-DD');
  const thirtyDaysAgoDate = toDate(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
  const todayDate = toDate(todayStr);

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
    toBalanceEntries(recentInitiatives),
    participatingLists.map((l) => ({ id: l.id, name: l.name }))
  );

  const listsWithLastTouched: ListWithLastTouched[] = participatingLists.map((list) => {
    const listBalance = balance.find((b) => b.listId === list.id);
    return {
      id: list.id,
      name: list.name,
      participatesInInitiative: list.participatesInInitiative ?? true,
      lastTouchedAt: listBalance?.lastUsedDate ? new Date(listBalance.lastUsedDate) : null,
    };
  });

  const suggestedList = getSuggestedList(listsWithLastTouched);

  return { balance, suggestedList };
}

/** Fetch today's and tomorrow's initiatives with balance data and suggestion */
export async function fetchTodayTomorrowInitiative(userId: string) {
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

  const todayInitiative = initiatives.find((i) => formatDateKey(i.date) === todayStr) ?? null;
  const tomorrowInitiative = initiatives.find((i) => formatDateKey(i.date) === tomorrowStr) ?? null;

  // Calculate balance and suggestion
  const { balance, suggestedList: suggested } = await fetchBalanceAndSuggestion(userId, participatingLists);

  // Only include suggestion if not both days are already set
  const suggestedList: ListWithLastTouched | null =
    (!tomorrowInitiative || !todayInitiative) ? suggested : null;

  return {
    todayInitiative,
    tomorrowInitiative,
    suggestedList,
    balance,
    participatingLists: lists,
  };
}

/** Validate and parse the body for creating an initiative */
export function parseCreateInitiativeBody(body: Record<string, unknown>): {
  error?: string;
  listId?: number;
  date?: string;
  reason?: string;
} {
  if (!body.listId || typeof body.listId !== 'number' || !Number.isFinite(body.listId)) {
    return { error: 'listId must be a valid number' };
  }

  if (body.date !== undefined && typeof body.date !== 'string') {
    return { error: 'date must be a string in YYYY-MM-DD format' };
  }

  if (body.reason !== undefined && typeof body.reason !== 'string') {
    return { error: 'reason must be a string' };
  }

  const todayStr = dayjs().format('YYYY-MM-DD');
  const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');

  if (body.date) {
    const isValid = /^\d{4}-\d{2}-\d{2}$/.test(body.date) && dayjs(body.date, 'YYYY-MM-DD', true).isValid();
    if (!isValid) {
      return { error: 'Invalid date format. Use YYYY-MM-DD' };
    }
    if (body.date !== todayStr && body.date !== tomorrowStr) {
      return { error: 'Can only set initiative for today or tomorrow' };
    }
  }

  return {
    listId: body.listId,
    date: typeof body.date === 'string' ? body.date : undefined,
    reason: typeof body.reason === 'string' ? body.reason : undefined,
  };
}

/** Create a new initiative record. Returns the created row or an error string. */
export async function createInitiative(
  userId: string,
  listId: number,
  date?: string,
  reason?: string,
): Promise<{ initiative: InitiativeRow } | { error: string; status: number }> {
  const tomorrowStr = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const targetDateStr = date ?? tomorrowStr;
  const targetDate = toDate(targetDateStr);

  // Verify the list exists and belongs to the user
  const [list] = await DB.select()
    .from(listsTable)
    .where(
      and(
        eq(listsTable.id, listId),
        eq(listsTable.userId, userId)
      )
    );

  if (!list) {
    return { error: 'List not found', status: 404 };
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
    return { error: 'Initiative for this date already exists. Use PATCH to change it.', status: 409 };
  }

  // Calculate the suggested list
  const lists = await DB.select()
    .from(listsTable)
    .where(
      and(
        eq(listsTable.userId, userId),
        eq(listsTable.participatesInInitiative, true),
        isNull(listsTable.archivedAt)
      )
    );

  const { suggestedList: suggested } = await fetchBalanceAndSuggestion(userId, lists);
  const suggestedListId = suggested?.id ?? null;

  // If user chose the suggested list, store it as suggested only (chosenListId = null)
  // If user chose a different list, store both suggested and chosen
  const chosenListId = listId === suggestedListId ? null : listId;

  const [inserted] = await DB.insert(currentInitiativeTable)
    .values({
      userId,
      date: targetDate,
      suggestedListId,
      chosenListId,
      reason: reason ?? null,
      setAt: new Date(),
    })
    .$returningId();

  const [created] = await DB.select()
    .from(currentInitiativeTable)
    .where(eq(currentInitiativeTable.id, inserted.id));

  return { initiative: created };
}

/** Fetch initiative history for a date range, including balance data and list name map */
export async function fetchInitiativeHistory(userId: string, days: number) {
  const todayStr = dayjs().format('YYYY-MM-DD');
  const startDateStr = dayjs().subtract(days, 'day').format('YYYY-MM-DD');
  const todayDate = toDate(todayStr);
  const startDate = toDate(startDateStr);

  // Get all lists for name lookup
  const lists = await DB.select()
    .from(listsTable)
    .where(eq(listsTable.userId, userId));

  const listMap = new Map(lists.map((l) => [l.id, l.name]));

  // Get initiatives for the period
  const initiatives = await DB.select()
    .from(currentInitiativeTable)
    .where(
      and(
        eq(currentInitiativeTable.userId, userId),
        gte(currentInitiativeTable.date, startDate),
        lte(currentInitiativeTable.date, todayDate)
      )
    )
    .orderBy(desc(currentInitiativeTable.date));

  // Calculate balance
  const participatingLists = getParticipatingLists(lists);
  const balance = calculateBalance(
    toBalanceEntries(initiatives),
    participatingLists.map((l) => ({ id: l.id, name: l.name }))
  );

  return {
    initiatives,
    listMap,
    balance,
    period: { startDate: startDateStr, endDate: todayStr, days },
  };
}
