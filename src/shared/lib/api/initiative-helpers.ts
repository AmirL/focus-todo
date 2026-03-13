import dayjs from 'dayjs';
import { and, eq, gte, lte, desc } from 'drizzle-orm';
import { currentInitiativeTable, listsTable } from '@/shared/lib/drizzle/schema';
import { DB } from '@/shared/lib/db';
import { calculateBalance, getSuggestedList, type ListWithLastTouched } from '@/entities/current-initiative';

type ListRow = typeof listsTable.$inferSelect;
type InitiativeRow = typeof currentInitiativeTable.$inferSelect;

/** Convert a YYYY-MM-DD string to a Date object for DB queries */
export function toDate(dateStr: string): Date {
  return dayjs(dateStr).toDate();
}

/** Format a Date to YYYY-MM-DD string */
export function formatDate(date: Date): string {
  return dayjs(date).format('YYYY-MM-DD');
}

/** Filter lists to only those participating in initiative */
export function getParticipatingLists(lists: ListRow[]): ListRow[] {
  return lists.filter((l) => l.participatesInInitiative);
}

/** Map raw initiative DB rows to the shape expected by calculateBalance */
export function toBalanceEntries(initiatives: InitiativeRow[]) {
  return initiatives.map((i) => ({
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
  }));
}

/** Fetch recent initiatives and compute balance + suggested list for a user */
export async function fetchBalanceAndSuggestion(
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
