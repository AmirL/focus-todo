import { fetchBackend } from '@/shared/lib/api';
import { TaskModel, TaskPlain } from '../model/task';

export async function updateTaskQuery(id: string, task: TaskModel) {
  const response = (await fetchBackend(`update-task`, { id, task: TaskModel.toPlain(task) })) as TaskPlain;

  const fetchedTask = TaskModel.toInstance(response);
  return fetchedTask;
}
