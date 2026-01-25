import { useQuery } from '@tanstack/react-query';
import { GoalModel, GoalPlain } from '@/entities/goal/model/goal';
import { fetchBackend } from '@/shared/lib/api';
import { useOptimisticMutation } from '@/shared/lib/optimistic-mutation';

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

// Create Goal Mutation
export function useCreateGoalMutation() {
  return useOptimisticMutation<GoalModel, GoalModel, GoalModel>({
    mutationFn: async (goal: GoalModel) => {
      const response = (await fetchBackend('create-goal', { goal: GoalModel.toPlain(goal) })) as GoalPlain;
      return GoalModel.toInstance(response);
    },
    queryKey: goalKeys.all,
    optimisticUpdate: (old, newGoal) => {
      if (!old) return [newGoal];
      return [...old, newGoal];
    },
  });
}

// Update Goal Mutation
export function useUpdateGoalMutation() {
  return useOptimisticMutation<GoalModel, GoalModel, GoalModel>({
    mutationFn: async (goal: GoalModel) => {
      const response = (await fetchBackend('update-goal', {
        id: goal.id,
        goal: GoalModel.toPlain(goal),
      })) as GoalPlain;
      return GoalModel.toInstance(response);
    },
    queryKey: goalKeys.all,
    optimisticUpdate: (old, updatedGoal) => {
      if (!old) return [updatedGoal];
      return old.map((g) => (g.id === updatedGoal.id ? updatedGoal : g));
    },
  });
}
