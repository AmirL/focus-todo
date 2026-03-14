import { currentInitiativeTable } from '@/shared/lib/drizzle/schema';
import { toISOString } from '@/shared/lib/api/serialize-helpers';
import dayjs from 'dayjs';

type InitiativeRow = typeof currentInitiativeTable.$inferSelect;

type ApiInitiative = Omit<InitiativeRow, 'date' | 'setAt' | 'changedAt'> & {
  date: string;
  setAt: string;
  changedAt: string | null;
};

type ApiInitiativeWithLists = ApiInitiative & {
  suggestedListName: string | null;
  chosenListName: string | null;
  effectiveListName: string | null;
};

function toDateString(d: Date | string | null | undefined): string {
  if (!d) return '';
  return dayjs(d).format('YYYY-MM-DD');
}

export function serializeInitiative(i: InitiativeRow): ApiInitiative {
  return {
    ...i,
    date: toDateString(i.date),
    setAt: toISOString(i.setAt)!,
    changedAt: toISOString(i.changedAt),
  };
}

export function serializeInitiativeWithLists(
  i: InitiativeRow,
  listMap: Map<number, string>
): ApiInitiativeWithLists {
  const effectiveListId = i.chosenListId ?? i.suggestedListId;
  return {
    ...serializeInitiative(i),
    suggestedListName: i.suggestedListId ? listMap.get(i.suggestedListId) ?? null : null,
    chosenListName: i.chosenListId ? listMap.get(i.chosenListId) ?? null : null,
    effectiveListName: effectiveListId ? listMap.get(effectiveListId) ?? null : null,
  };
}
