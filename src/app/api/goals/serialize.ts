import { goalsTable } from '@/shared/lib/drizzle/schema';
import { toISOString } from '@/shared/lib/api/serialize-helpers';

type GoalRow = typeof goalsTable.$inferSelect;

type ApiGoal = Omit<GoalRow, '__list_deprecated' | 'deletedAt' | 'createdAt'> & {
  deletedAt: string | null;
  createdAt: string;
};

type ApiGoalWithList = ApiGoal & { listName: string | null };

export function serializeGoal(g: GoalRow): ApiGoal {
  const { __list_deprecated: _, ...rest } = g;
  return {
    ...rest,
    deletedAt: toISOString(g.deletedAt),
    createdAt: toISOString(g.createdAt) ?? new Date().toISOString(),
  };
}

export function serializeGoalWithList(g: GoalRow, listName?: string | null): ApiGoalWithList {
  return {
    ...serializeGoal(g),
    listName: listName ?? null,
  };
}
