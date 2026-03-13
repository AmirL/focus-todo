import dayjs from 'dayjs';
import { currentInitiativeTable, listsTable } from '@/shared/lib/drizzle/schema';

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
