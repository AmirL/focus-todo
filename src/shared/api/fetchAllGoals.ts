import { GoalModel, GoalPlain } from '@/entities/goal/model/goal';
import { fetchBackend } from '@/shared/lib/api';

export async function fetchAllGoals() {
  const data = (await fetchBackend('get-goals')) as { goals: GoalPlain[] };
  const fetchedGoals = GoalModel.fromPlainArray(data.goals);
  return fetchedGoals;
}
