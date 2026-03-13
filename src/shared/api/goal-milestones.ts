import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MilestoneModel, type MilestonePlain, GoalModel, type GoalPlain } from '@/entities/goal';
import { fetchBackend } from '@/shared/lib/api';
import { goalKeys } from '@/shared/api/goals';

const milestoneKeys = {
  byGoal: (goalId: string) => ['goal-milestones', goalId] as const,
};

export function useGoalMilestonesQuery(goalId: string) {
  return useQuery({
    queryKey: milestoneKeys.byGoal(goalId),
    queryFn: async () => {
      const data = await fetchBackend<{
        milestones: MilestonePlain[];
      }>('get-goal-milestones', { goalId: Number(goalId) });
      return MilestoneModel.fromPlainArray(data.milestones);
    },
  });
}

export function useCreateMilestoneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { goalId: string; progress: number; description: string }) => {
      const response = await fetchBackend<{ milestone: MilestonePlain; goal: GoalPlain }>('create-goal-milestone', {
        goalId: Number(params.goalId),
        progress: params.progress,
        description: params.description,
      });
      return {
        milestone: MilestoneModel.toInstance(response.milestone),
        goal: GoalModel.toInstance(response.goal),
      };
    },
    onSuccess: (data, params) => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.byGoal(params.goalId) });
      queryClient.setQueryData<GoalModel[]>(goalKeys.all, (old) => {
        if (!old) return old;
        return old.map((g) => (g.id === params.goalId ? data.goal : g));
      });
    },
  });
}
