import { useGoalsQuery } from '@/shared/api/goals';

export function useGoalsLoader() {
  const { data: goals = [] } = useGoalsQuery();
  return goals;
}
