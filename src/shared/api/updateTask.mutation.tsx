import { fetchBackend } from '@/shared/lib/api';
import { TaskModel, TaskPlain } from '@/entities/task/model/task';

export async function updateTaskMutation(task: TaskModel) {
  const response = (await fetchBackend(`update-task`, { id: task.id, task: TaskModel.toPlain(task) })) as TaskPlain;

  const fetchedTask = TaskModel.toInstance(response);
  return fetchedTask;
}
