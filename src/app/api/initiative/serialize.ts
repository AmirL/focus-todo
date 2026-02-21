import { NextResponse } from 'next/server';
import { currentInitiativeTable } from '@/shared/lib/drizzle/schema';
import dayjs from 'dayjs';

export type InitiativeRow = typeof currentInitiativeTable.$inferSelect;

export type ApiInitiative = Omit<InitiativeRow, 'date' | 'setAt' | 'changedAt'> & {
  date: string;
  setAt: string;
  changedAt: string | null;
};

export type ApiInitiativeWithLists = ApiInitiative & {
  suggestedListName: string | null;
  chosenListName: string | null;
  effectiveListName: string | null;
};

function toISOString(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function toDateString(d: Date | string | null | undefined): string {
  if (!d) return '';
  if (d instanceof Date) return dayjs(d).format('YYYY-MM-DD');
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

export function handleApiError(error: unknown, operation: string) {
  const msg = error instanceof Error ? error.message : 'Unknown error occurred';
  const lower = msg.toLowerCase();
  const isAuth = lower.includes('api key required') || lower.includes('invalid or revoked api key');
  const status = isAuth ? 401 : 500;
  if (!isAuth) {
    console.error(`Error in ${operation}:`, error);
  }
  return NextResponse.json({ error: msg }, { status });
}
