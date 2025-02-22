import { fetchBackend } from '@/shared/lib/api';
import { TaskModel, TaskPlain } from '../model/task';

export async function createTaskQuery(task: TaskModel) {
  const response = (await fetchBackend('create-task', { task: TaskModel.toPlain(task) })) as TaskPlain;
  const createdTask = TaskModel.toInstance(response);
  return createdTask;
}
