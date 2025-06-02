import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TaskModel, TaskPlain } from '@/entities/task/model/task';
import { fetchBackend } from '@/shared/lib/api';
import toast from 'react-hot-toast';

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every 60 seconds
  });
}

// Create Task Mutation
export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: TaskModel) => {
      const response = (await fetchBackend('create-task', { task: TaskModel.toPlain(task) })) as TaskPlain;
      return TaskModel.toInstance(response);
    },
    onSuccess: (createdTask) => {
      // Optimistically update the cache
      queryClient.setQueryData<TaskModel[]>(taskKeys.all, (old) => {
        if (!old) return [createdTask];
        return [...old, createdTask];
      });
      toast.success('Task created');
    },
    onError: () => {
      // Error is handled by the global error handler in ReactQueryProvider
    },
  });
}

// Update Task Mutation
export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: TaskModel) => {
      const response = (await fetchBackend(`update-task`, { id: task.id, task: TaskModel.toPlain(task) })) as TaskPlain;
      return TaskModel.toInstance(response);
    },
    onSuccess: (updatedTask) => {
      // Optimistically update the cache
      queryClient.setQueryData<TaskModel[]>(taskKeys.all, (old) => {
        if (!old) return [updatedTask];
        return old.map((task) => (task.id === updatedTask.id ? updatedTask : task));
      });
    },
  });
}
