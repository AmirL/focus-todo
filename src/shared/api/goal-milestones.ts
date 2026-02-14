import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MilestoneModel, MilestonePlain } from '@/entities/goal/model/milestone';
import { GoalModel, GoalPlain } from '@/entities/goal/model/goal';
import { fetchBackend } from '@/shared/lib/api';
import { goalKeys } from '@/shared/api/goals';

export const milestoneKeys = {
  byGoal: (goalId: string) => ['goal-milestones', goalId] as const,
};

export function useGoalMilestonesQuery(goalId: string) {
  return useQuery({
    queryKey: milestoneKeys.byGoal(goalId),
    queryFn: async () => {
      const data = (await fetchBackend('get-goal-milestones', { goalId: Number(goalId) })) as {
        milestones: MilestonePlain[];
      };
      return MilestoneModel.fromPlainArray(data.milestones);
    },
  });
}

export function useCreateMilestoneMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { goalId: string; progress: number; description: string }) => {
      const response = (await fetchBackend('create-goal-milestone', {
        goalId: Number(params.goalId),
        progress: params.progress,
        description: params.description,
      })) as { milestone: MilestonePlain; goal: GoalPlain };
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
