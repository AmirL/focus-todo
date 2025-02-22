import { fetchBackend } from '@/shared/lib/api';
import { GoalModel, GoalPlain } from '../model/goal';

export async function fetchAllGoals() {
  const data = (await fetchBackend('get-goals')) as { goals: GoalPlain[] };
  const fetchedGoals = GoalModel.fromPlainArray(data.goals);
  return fetchedGoals;
}
