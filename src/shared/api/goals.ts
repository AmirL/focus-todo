import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

// Create Goal Mutation
export function useCreateGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: GoalModel) => {
      const response = (await fetchBackend('create-goal', { goal: GoalModel.toPlain(goal) })) as GoalPlain;
      return GoalModel.toInstance(response);
    },
    onSuccess: (createdGoal) => {
      queryClient.setQueryData<GoalModel[]>(goalKeys.all, (old) => {
        if (!old) return [createdGoal];
        return [...old, createdGoal];
      });
    },
  });
}

// Update Goal Mutation
export function useUpdateGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: GoalModel) => {
      const response = (await fetchBackend('update-goal', {
        id: goal.id,
        goal: GoalModel.toPlain(goal),
      })) as GoalPlain;
      return GoalModel.toInstance(response);
    },
    onSuccess: (updatedGoal) => {
      queryClient.setQueryData<GoalModel[]>(goalKeys.all, (old) => {
        if (!old) return updatedGoal.deletedAt ? [] : [updatedGoal];
        
        // If goal is deleted, remove it from the cache
        if (updatedGoal.deletedAt) {
          return old.filter((g) => g.id !== updatedGoal.id);
        }
        
        // Otherwise update the goal
        return old.map((g) => (g.id === updatedGoal.id ? updatedGoal : g));
      });
    },
  });
}
