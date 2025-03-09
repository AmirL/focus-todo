import { fetchBackend } from '@/shared/lib/api';
import { TaskModel, TaskPlain } from '@/entities/task/model/task';
import toast from 'react-hot-toast';

export async function createTaskMutation(task: TaskModel) {
  const response = (await fetchBackend('create-task', { task: TaskModel.toPlain(task) })) as TaskPlain;
  const createdTask = TaskModel.toInstance(response);

  toast.success('Task created');
  return createdTask;
}
