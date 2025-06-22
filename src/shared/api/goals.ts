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
    onMutate: async (newGoal) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: goalKeys.all });

      // Snapshot the previous value
      const previousGoals = queryClient.getQueryData<GoalModel[]>(goalKeys.all);

      // Optimistically update to the new value
      queryClient.setQueryData<GoalModel[]>(goalKeys.all, (old) => {
        if (!old) return [newGoal];
        return [...old, newGoal];
      });

      // Return a context object with the snapshotted value
      return { previousGoals };
    },
    onError: (err, newGoal, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData<GoalModel[]>(goalKeys.all, context?.previousGoals);
    },
    onSuccess: (createdGoal) => {
      // No need to update cache here since it was already done optimistically
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
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
    onMutate: async (updatedGoal) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: goalKeys.all });

      // Snapshot the previous value
      const previousGoals = queryClient.getQueryData<GoalModel[]>(goalKeys.all);

      // Optimistically update to the new value
      queryClient.setQueryData<GoalModel[]>(goalKeys.all, (old) => {
        if (!old) return [updatedGoal];
        
        // Always update the goal in the cache (keep deleted goals visible)
        return old.map((g) => (g.id === updatedGoal.id ? updatedGoal : g));
      });

      // Return a context object with the snapshotted value
      return { previousGoals };
    },
    onError: (err, updatedGoal, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData<GoalModel[]>(goalKeys.all, context?.previousGoals);
    },
    onSuccess: (updatedGoal) => {
      // No need to update cache here since it was already done optimistically
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}
