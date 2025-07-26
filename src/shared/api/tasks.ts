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
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 1 * 60 * 1000, // Refetch every 1 minute
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
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<TaskModel[]>(taskKeys.all);

      // Optimistically add the new task to the cache
      queryClient.setQueryData<TaskModel[]>(taskKeys.all, (old) => {
        if (!old) return [newTask];
        return [...old, newTask];
      });

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (_err, _newTask, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData<TaskModel[]>(taskKeys.all, context?.previousTasks);
    },
    onSuccess: () => {
      toast.success('Task created');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data with proper server-assigned IDs
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
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
    onMutate: async (updatedTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<TaskModel[]>(taskKeys.all);

      // Optimistically update to the new value
      queryClient.setQueryData<TaskModel[]>(taskKeys.all, (old) => {
        if (!old) return [updatedTask];
        
        // Always update the task in the cache (keep deleted tasks visible)
        return old.map((task) => (task.id === updatedTask.id ? updatedTask : task));
      });

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (_err, _updatedTask, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData<TaskModel[]>(taskKeys.all, context?.previousTasks);
    },
    onSuccess: () => {
      // No need to update cache here since it was already done optimistically
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
