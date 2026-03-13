import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TaskModel, TaskPlain } from '@/entities/task/model/task';
import { fetchBackend } from '@/shared/lib/api';
import toast from 'react-hot-toast';
import { useEditTaskModalStore } from '@/features/tasks/edit/model/editTaskModalStore';
import { timeEntryKeys, type TimeEntry } from '@/shared/api/time-entries';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: string) => [...taskKeys.lists(), { filters }] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

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

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: TaskModel) => {
      const response = (await fetchBackend('create-task', { task: TaskModel.toPlain(task) })) as TaskPlain;
      return TaskModel.toInstance(response);
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previousTasks = queryClient.getQueryData<TaskModel[]>(taskKeys.all);
      queryClient.setQueryData<TaskModel[]>(taskKeys.all, (old) => {
        if (!old) return [newTask];
        return [...old, newTask];
      });
      return { previousTasks };
    },
    onError: (_err, _newTask, context) => {
      queryClient.setQueryData<TaskModel[]>(taskKeys.all, context?.previousTasks);
    },
    onSuccess: (createdTask) => {
      toast.success(
        (t) => (
          <span className="flex items-center gap-2">
            Task created: {createdTask.name}
            <button
              onClick={() => {
                useEditTaskModalStore.getState().openWithTask(createdTask);
                toast.dismiss(t.id);
              }}
              className="ml-2 text-blue-600 underline hover:text-blue-800"
            >
              Edit
            </button>
          </span>
        ),
        { duration: 5000 }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: TaskModel) => {
      const response = (await fetchBackend(`update-task`, { id: task.id, task: TaskModel.toPlain(task) })) as TaskPlain;
      return TaskModel.toInstance(response);
    },
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previousTasks = queryClient.getQueryData<TaskModel[]>(taskKeys.all);
      queryClient.setQueryData<TaskModel[]>(taskKeys.all, (old) => {
        if (!old) return [updatedTask];
        return old.map((task) => (task.id === updatedTask.id ? updatedTask : task));
      });
      return { previousTasks };
    },
    onError: (_err, _updatedTask, context) => {
      queryClient.setQueryData<TaskModel[]>(taskKeys.all, context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useCreateCompletedTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      task: { name: string; listId: number };
      startedAt: string;
      endedAt: string;
    }) => {
      const response = (await fetchBackend('create-completed-task', data)) as {
        task: TaskPlain;
        timeEntry: TimeEntry;
      };
      return { task: TaskModel.toInstance(response.task), timeEntry: response.timeEntry };
    },
    onSuccess: ({ task }) => {
      toast.success(`Logged: ${task.name}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: timeEntryKeys.all });
    },
  });
}
