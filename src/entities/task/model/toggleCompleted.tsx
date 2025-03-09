import { updateTaskMutation } from '@/shared/api/updateTask.mutation';
import { TaskModel } from './task';
import { useTasksStore } from './tasksStore';

export async function toggleCompleted(task: TaskModel) {
  const store = useTasksStore.getState();
  const completedAt = task.completedAt ? null : new Date();
  const updatedTask = store.updateTask(task.id, { completedAt });
  await updateTaskMutation(updatedTask);
}
