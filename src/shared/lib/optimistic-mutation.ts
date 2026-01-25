import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

/**
 * Context for optimistic mutations - stores previous data for rollback
 */
interface OptimisticMutationContext<TData> {
  previousData: TData[] | undefined;
}

/**
 * Options for creating an optimistic mutation hook
 */
interface OptimisticMutationOptions<TData, TVariables, TResponse> {
  /** Function to execute the mutation */
  mutationFn: (variables: TVariables) => Promise<TResponse>;
  /** Query key to update/invalidate */
  queryKey: readonly unknown[];
  /** Function to optimistically update the cache */
  optimisticUpdate: (old: TData[] | undefined, variables: TVariables) => TData[];
  /** Callback on successful mutation */
  onSuccess?: (data: TResponse, variables: TVariables, context: OptimisticMutationContext<TData> | undefined) => void;
  /** Callback on mutation error */
  onError?: (error: unknown, variables: TVariables, context: OptimisticMutationContext<TData> | undefined) => void;
  /** Callback after mutation settles (success or error) */
  onSettled?: (data: TResponse | undefined, error: unknown | null, variables: TVariables, context: OptimisticMutationContext<TData> | undefined) => void;
  /** Toast message to show on success */
  successMessage?: string;
  /** Toast message to show on error */
  errorMessage?: string;
}

/**
 * Generic hook for creating optimistic mutations with automatic cache management.
 * Handles optimistic updates, rollback on error, and cache invalidation.
 *
 * @example
 * const mutation = useOptimisticMutation({
 *   mutationFn: async (task: TaskModel) => api.createTask(task),
 *   queryKey: ['tasks'],
 *   optimisticUpdate: (old, newTask) => [...(old || []), newTask],
 *   successMessage: 'Task created',
 * });
 */
export function useOptimisticMutation<TData, TVariables, TResponse = TData>({
  mutationFn,
  queryKey,
  optimisticUpdate,
  onSuccess,
  onError,
  onSettled,
  successMessage,
  errorMessage,
}: OptimisticMutationOptions<TData, TVariables, TResponse>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables): Promise<OptimisticMutationContext<TData>> => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData[]>(queryKey);

      // Apply optimistic update
      queryClient.setQueryData<TData[]>(queryKey, (old) => optimisticUpdate(old, variables));

      // Return context object with the snapshotted value
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Roll back to previous state
      if (context?.previousData) {
        queryClient.setQueryData<TData[]>(queryKey, context.previousData);
      }
      if (errorMessage) {
        toast.error(errorMessage);
      }
      onError?.(err, variables, context);
    },
    onSuccess: (data, variables, context) => {
      if (successMessage) {
        toast.success(successMessage);
      }
      onSuccess?.(data, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey });
      onSettled?.(data, error, variables, context);
    },
  });
}
