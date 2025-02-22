import { fetchBackend } from '@/shared/lib/api';
import { TaskPlain, TaskModel } from '../model/task';

export async function fetchAllTasks() {
  const data = (await fetchBackend('get-tasks')) as { tasks: TaskPlain[] };
  const fetchedTasks = TaskModel.fromPlainArray(data.tasks);
  return fetchedTasks;
}
