import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ListModel, ListPlain } from '@/entities/list';
import { fetchBackend } from '@/shared/lib/api';
import { useOptimisticMutation } from '@/shared/lib/optimistic-mutation';

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
  return useOptimisticMutation<ListModel, string, ListModel>({
    mutationFn: async (name) => {
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
  return useOptimisticMutation<ListModel, { id: string; name: string }, ListModel>({
    mutationFn: async ({ id, name }) => {
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

  return useOptimisticMutation<ListModel, { id: string; reassignToListId?: string }, string>({
    mutationFn: async ({ id, reassignToListId }) => {
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