import { useGoalsStore } from '@/shared/model/goalsStore';
import { useEffect } from 'react';

export function useGoalsLoader() {
  const fetchGoals = useGoalsStore((state) => state.fetchGoals);
  const goals = useGoalsStore((state) => state.goals);

  useEffect(() => {
    if (goals.length == 0) fetchGoals();
  }, [fetchGoals, goals.length]);
  return goals;
}
