import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ListModel, ListPlain } from '@/entities/list';
import { fetchBackend } from '@/shared/lib/api';
import toast from 'react-hot-toast';

// Context type for optimistic mutations
interface OptimisticMutationContext {
  previousLists: ListModel[] | undefined;
}

// Generic optimistic mutation hook types
interface OptimisticMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: readonly unknown[];
  optimisticUpdate: (old: ListModel[] | undefined, variables: TVariables) => ListModel[];
  onSuccess?: (data: TData, variables: TVariables, context: OptimisticMutationContext | undefined) => void;
  onError?: (error: unknown, variables: TVariables, context: OptimisticMutationContext | undefined) => void;
  onSettled?: (data: TData | undefined, error: unknown | null, variables: TVariables, context: OptimisticMutationContext | undefined) => void;
  successMessage?: string;
  errorMessage?: string;
}

// Generic optimistic mutation hook
function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  queryKey,
  optimisticUpdate,
  onSuccess,
  onError,
  onSettled,
  successMessage,
  errorMessage,
}: OptimisticMutationOptions<TData, TVariables>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables): Promise<OptimisticMutationContext> => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousLists = queryClient.getQueryData<ListModel[]>(queryKey);

      // Apply optimistic update
      queryClient.setQueryData<ListModel[]>(queryKey, (old) => optimisticUpdate(old, variables));

      // Return context object with the snapshotted value
      return { previousLists };
    },
    onError: (err, variables, context) => {
      // Roll back to previous state
      if (context?.previousLists) {
        queryClient.setQueryData<ListModel[]>(queryKey, context.previousLists);
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

// Query Keys
export const listKeys = {
  all: ['lists'] as const,
  details: () => [...listKeys.all, 'detail'] as const,
  detail: (id: string) => [...listKeys.details(), id] as const,
};

// Fetch Lists Query
export function useListsQuery() {
  return useQuery({
    queryKey: listKeys.all,
    queryFn: async () => {
      const data = (await fetchBackend('get-lists')) as { lists: ListPlain[] };
      return ListModel.fromPlainArray(data.lists);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// Create List Mutation
export function useCreateListMutation() {
  return useOptimisticMutation({
    mutationFn: async (name: string) => {
      const response = (await fetchBackend('create-list', { name })) as ListPlain;
      return ListModel.toInstance(response);
    },
    queryKey: listKeys.all,
    optimisticUpdate: (old, name) => {
      // Optimistically add the new list to the cache
      const optimisticList = {
        id: 'temp-' + Date.now(),
        name,
        userId: 'temp',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: null,
      } as unknown as ListModel;

      if (!old) return [optimisticList];
      return [...old, optimisticList];
    },
    successMessage: 'List created',
    errorMessage: 'Failed to create list',
  });
}

// Update List Mutation
export function useUpdateListMutation() {
  return useOptimisticMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = (await fetchBackend('update-list', { id, name })) as ListPlain;
      return ListModel.toInstance(response);
    },
    queryKey: listKeys.all,
    optimisticUpdate: (old, { id, name }) => {
      if (!old) return [];
      return old.map((list) =>
        list.id === id ? { ...list, name, updatedAt: new Date() } : list
      );
    },
    successMessage: 'List updated',
    errorMessage: 'Failed to update list',
  });
}

// Delete List Mutation
export function useDeleteListMutation() {
  const queryClient = useQueryClient();

  return useOptimisticMutation({
    mutationFn: async ({ id, reassignToListId }: { id: string; reassignToListId?: string }) => {
      await fetchBackend('delete-list', { id, reassignToListId });
      return id;
    },
    queryKey: listKeys.all,
    optimisticUpdate: (old, { id }) => {
      if (!old) return [];
      return old.filter((list) => list.id !== id);
    },
    successMessage: 'List deleted',
    errorMessage: 'Failed to delete list',
    onSuccess: () => {
      // Also invalidate tasks and goals queries since they might be affected
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}