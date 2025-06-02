import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { TaskModel } from './task';
import { createInstance } from '@/shared/lib/instance-tools';

export function useToggleTaskCompleted() {
  const updateTaskMutation = useUpdateTaskMutation();

  return {
    mutate: (task: TaskModel) => {
      const completedAt = task.completedAt ? null : new Date();
      const updatedTask = createInstance(TaskModel, { ...task, completedAt, updatedAt: new Date() });
      updateTaskMutation.mutate(updatedTask);
    },
    mutateAsync: async (task: TaskModel) => {
      const completedAt = task.completedAt ? null : new Date();
      const updatedTask = createInstance(TaskModel, { ...task, completedAt, updatedAt: new Date() });
      return updateTaskMutation.mutateAsync(updatedTask);
    },
    isLoading: updateTaskMutation.isPending,
  };
}
