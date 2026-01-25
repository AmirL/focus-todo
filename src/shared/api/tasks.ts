import { useQuery } from '@tanstack/react-query';
import { TaskModel, TaskPlain } from '@/entities/task/model/task';
import { fetchBackend } from '@/shared/lib/api';
import { useOptimisticMutation } from '@/shared/lib/optimistic-mutation';

// Query Keys
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: string) => [...taskKeys.lists(), { filters }] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

// Fetch Tasks Query
export function useTasksQuery() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: async () => {
      const data = (await fetchBackend('get-tasks')) as { tasks: TaskPlain[] };
      return TaskModel.fromPlainArray(data.tasks);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 1 * 60 * 1000, // Refetch every 1 minute
  });
}

// Create Task Mutation
export function useCreateTaskMutation() {
  return useOptimisticMutation<TaskModel, TaskModel, TaskModel>({
    mutationFn: async (task: TaskModel) => {
      const response = (await fetchBackend('create-task', { task: TaskModel.toPlain(task) })) as TaskPlain;
      return TaskModel.toInstance(response);
    },
    queryKey: taskKeys.all,
    optimisticUpdate: (old, newTask) => {
      if (!old) return [newTask];
      return [...old, newTask];
    },
    successMessage: 'Task created',
  });
}

// Update Task Mutation
export function useUpdateTaskMutation() {
  return useOptimisticMutation<TaskModel, TaskModel, TaskModel>({
    mutationFn: async (task: TaskModel) => {
      const response = (await fetchBackend('update-task', { id: task.id, task: TaskModel.toPlain(task) })) as TaskPlain;
      return TaskModel.toInstance(response);
    },
    queryKey: taskKeys.all,
    optimisticUpdate: (old, updatedTask) => {
      if (!old) return [updatedTask];
      return old.map((task) => (task.id === updatedTask.id ? updatedTask : task));
    },
  });
}
