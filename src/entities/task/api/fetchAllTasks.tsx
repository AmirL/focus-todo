import { fetchBackend } from '@/shared/lib/api';
import { TaskModel, TaskPlain } from '../model/task';

export async function fetchAllTasks() {
  const data = (await fetchBackend('get-tasks')) as { tasks: TaskPlain[] };
  const fetchedTasks = TaskModel.fromPlainArray(data.tasks);
  return fetchedTasks;
}
