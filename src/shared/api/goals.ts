import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GoalModel, GoalPlain } from '@/entities/goal/model/goal';
import { fetchBackend } from '@/shared/lib/api';

export const goalKeys = {
  all: ['goals'] as const,
};

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

export function useCreateGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: GoalModel) => {
      const response = (await fetchBackend('create-goal', { goal: GoalModel.toPlain(goal) })) as GoalPlain;
      return GoalModel.toInstance(response);
    },
    onMutate: async (newGoal) => {
      await queryClient.cancelQueries({ queryKey: goalKeys.all });
      const previousGoals = queryClient.getQueryData<GoalModel[]>(goalKeys.all);
      queryClient.setQueryData<GoalModel[]>(goalKeys.all, (old) => {
        if (!old) return [newGoal];
        return [...old, newGoal];
      });
      return { previousGoals };
    },
    onError: (_err, _newGoal, context) => {
      queryClient.setQueryData<GoalModel[]>(goalKeys.all, context?.previousGoals);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}

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
    onMutate: async (updatedGoal: GoalModel) => {
      await queryClient.cancelQueries({ queryKey: goalKeys.all });
      const previousGoals = queryClient.getQueryData<GoalModel[]>(goalKeys.all);
      queryClient.setQueryData<GoalModel[]>(goalKeys.all, (old) => {
        if (!old) return [updatedGoal];
        return old.map((g) => (g.id === updatedGoal.id ? updatedGoal : g));
      });
      return { previousGoals };
    },
    onError: (_err, _updatedGoal, context) => {
      queryClient.setQueryData<GoalModel[]>(goalKeys.all, context?.previousGoals);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}
