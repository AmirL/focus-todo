import { NextResponse } from 'next/server';
import { goalsTable } from '@/shared/lib/drizzle/schema';

export type GoalRow = typeof goalsTable.$inferSelect;

export type ApiGoal = Omit<GoalRow, '__list_deprecated' | 'deletedAt'> & {
  deletedAt: string | null;
};

export type ApiGoalWithList = ApiGoal & { listName: string | null };

function toISOString(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  if (d instanceof Date) return d.toISOString();
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function serializeGoal(g: GoalRow): ApiGoal {
  const { __list_deprecated: _, ...rest } = g;
  return {
    ...rest,
    deletedAt: toISOString(g.deletedAt),
  };
}

export function serializeGoalWithList(g: GoalRow, listName?: string | null): ApiGoalWithList {
  return {
    ...serializeGoal(g),
    listName: listName ?? null,
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
