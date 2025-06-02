import { useQuery } from '@tanstack/react-query';
import { GoalModel, GoalPlain } from '@/entities/goal/model/goal';
import { fetchBackend } from '@/shared/lib/api';

// Query Keys
export const goalKeys = {
  all: ['goals'] as const,
};

// Fetch Goals Query
export function useGoalsQuery() {
  return useQuery({
    queryKey: goalKeys.all,
    queryFn: async () => {
      const data = (await fetchBackend('get-goals')) as { goals: GoalPlain[] };
      return GoalModel.fromPlainArray(data.goals);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - goals change less frequently
  });
}
