import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskModel, TaskPlain } from '@/entities/task/model/task';
import { useReorderStore } from './reorderStore';

interface ReorderTasksParams {
  taskIds: string[];
  context: {
    statusFilter: string;
    list: string;
  };
}

interface ReorderResponse {
  success: boolean;
  tasks: TaskPlain[];
  message: string;
}

async function reorderTasks(params: ReorderTasksParams): Promise<ReorderResponse> {
  const response = await fetch('/api/reorder-tasks', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to reorder tasks');
  }

  return response.json();
}

export function useReorderMutation() {
  const queryClient = useQueryClient();
  const { clearOptimisticTasks, setIsDragging } = useReorderStore();

  return useMutation({
    mutationFn: reorderTasks,
    onSuccess: (data) => {
      // Update query cache with new task data instead of invalidating
      const updatedTasks = data.tasks.map(task => TaskModel.toInstance(task));
      queryClient.setQueryData(['tasks'], (oldData: TaskModel[] | undefined) => {
        if (!oldData) return updatedTasks;

        // Update only the reordered tasks in the cache
        const taskMap = new Map(updatedTasks.map(task => [task.id, task]));
        return oldData.map(task => taskMap.get(task.id) || task);
      });

      clearOptimisticTasks();
      setIsDragging(false);
    },
    onError: (error) => {
      console.error('Failed to reorder tasks:', error);
      // Clear optimistic state on error - will revert to server state
      clearOptimisticTasks();
      setIsDragging(false);
    },
    onSettled: () => {
      // Always clear optimistic state and dragging flag when mutation settles
      clearOptimisticTasks();
      setIsDragging(false);
    },
  });
}