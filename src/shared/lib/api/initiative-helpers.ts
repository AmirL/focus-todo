import dayjs from 'dayjs';
import { listsTable } from '@/shared/lib/drizzle/schema';

type ListRow = typeof listsTable.$inferSelect;

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
