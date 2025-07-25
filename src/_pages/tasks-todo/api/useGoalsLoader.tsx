import { useGoalsQuery } from '@/shared/api/goals';

export function useGoalsLoader() {
  const { data: goals = [], isLoading, error } = useGoalsQuery();
  return { goals, isLoading, error };
}
