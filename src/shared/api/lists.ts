import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ListModel, ListPlain } from '@/entities/list';
import { fetchBackend } from '@/shared/lib/api';
import toast from 'react-hot-toast';

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const response = (await fetchBackend('create-list', { name })) as ListPlain;
      return ListModel.toInstance(response);
    },
    onMutate: async (name) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: listKeys.all });

      // Snapshot the previous value
      const previousLists = queryClient.getQueryData<ListModel[]>(listKeys.all);

      // Optimistically add the new list to the cache
      const optimisticList = {
        id: 'temp-' + Date.now(),
        name,
        userId: 'temp',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: null,
      } as unknown as ListModel;

      queryClient.setQueryData<ListModel[]>(listKeys.all, (old) => {
        if (!old) return [optimisticList];
        return [...old, optimisticList];
      });

      // Return a context object with the snapshotted value
      return { previousLists };
    },
    onError: (_err, _name, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData<ListModel[]>(listKeys.all, context?.previousLists);
      toast.error('Failed to create list');
    },
    onSuccess: () => {
      toast.success('List created');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}

// Update List Mutation
export function useUpdateListMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = (await fetchBackend('update-list', { id, name })) as ListPlain;
      return ListModel.toInstance(response);
    },
    onMutate: async ({ id, name }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: listKeys.all });

      // Snapshot the previous value
      const previousLists = queryClient.getQueryData<ListModel[]>(listKeys.all);

      // Optimistically update the list in the cache
      queryClient.setQueryData<ListModel[]>(listKeys.all, (old) => {
        if (!old) return [];
        return old.map((list) =>
          list.id === id ? { ...list, name, updatedAt: new Date() } : list
        );
      });

      // Return a context object with the snapshotted value
      return { previousLists };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData<ListModel[]>(listKeys.all, context?.previousLists);
      toast.error('Failed to update list');
    },
    onSuccess: () => {
      toast.success('List updated');
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}

// Delete List Mutation
export function useDeleteListMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reassignToListId }: { id: string; reassignToListId?: string }) => {
      await fetchBackend('delete-list', { id, reassignToListId });
      return id;
    },
    onMutate: async ({ id }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: listKeys.all });

      // Snapshot the previous value
      const previousLists = queryClient.getQueryData<ListModel[]>(listKeys.all);

      // Optimistically remove the list from the cache
      queryClient.setQueryData<ListModel[]>(listKeys.all, (old) => {
        if (!old) return [];
        return old.filter((list) => list.id !== id);
      });

      // Return a context object with the snapshotted value
      return { previousLists };
    },
    onError: (_err, _variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData<ListModel[]>(listKeys.all, context?.previousLists);
      toast.error('Failed to delete list');
    },
    onSuccess: () => {
      toast.success('List deleted');
      // Also invalidate tasks and goals queries since they might be affected
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
  });
}