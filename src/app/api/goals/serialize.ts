import { goalsTable } from '@/shared/lib/drizzle/schema';
import { toISOString } from '@/shared/lib/api/serialize-helpers';

export { handleApiError } from '@/shared/lib/api/serialize-helpers';

export type GoalRow = typeof goalsTable.$inferSelect;

export type ApiGoal = Omit<GoalRow, '__list_deprecated' | 'deletedAt'> & {
  deletedAt: string | null;
};

export type ApiGoalWithList = ApiGoal & { listName: string | null };

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
