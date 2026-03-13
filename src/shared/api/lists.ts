import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ListModel, ListPlain } from '@/entities/list';
import { fetchBackend } from '@/shared/lib/api';
import toast from 'react-hot-toast';
import { cloneInstance } from '@/shared/lib/instance-tools';

interface OptimisticMutationContext {
  previousLists: ListModel[] | undefined;
}

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
      await queryClient.cancelQueries({ queryKey });
      const previousLists = queryClient.getQueryData<ListModel[]>(queryKey);
      queryClient.setQueryData<ListModel[]>(queryKey, (old) => optimisticUpdate(old, variables));
      return { previousLists };
    },
    onError: (err, variables, context) => {
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
      queryClient.invalidateQueries({ queryKey });
      onSettled?.(data, error, variables, context);
    },
  });
}

export const listKeys = {
  all: ['lists'] as const,
  active: ['lists', { includeArchived: false }] as const,
  withArchived: ['lists', { includeArchived: true }] as const,
  details: () => [...listKeys.all, 'detail'] as const,
  detail: (id: string) => [...listKeys.details(), id] as const,
};

export function useListsQuery(options?: { includeArchived?: boolean }) {
  const includeArchived = options?.includeArchived ?? false;
  const queryKey = includeArchived ? listKeys.withArchived : listKeys.active;

  return useQuery({
    queryKey,
    queryFn: async () => {
      const body = includeArchived ? { includeArchived: true } : undefined;
      const data = (await fetchBackend('get-lists', body)) as { lists: ListPlain[] };
      return ListModel.fromPlainArray(data.lists);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useCreateListMutation() {
  return useOptimisticMutation({
    mutationFn: async ({ name, description, participatesInInitiative, color }: { name: string; description?: string | null; participatesInInitiative: boolean; color?: string | null }) => {
      const response = (await fetchBackend('create-list', { name, description, participatesInInitiative, color })) as ListPlain;
      return ListModel.toInstance(response);
    },
    queryKey: listKeys.all,
    optimisticUpdate: (old, { name, description, participatesInInitiative, color }) => {
      const maxSortOrder = old ? Math.max(...old.map((l) => l.sortOrder), -1) : -1;
      const optimisticList = {
        id: 'temp-' + Date.now(),
        name,
        description: description ?? null,
        color: color ?? null,
        userId: 'temp',
        isDefault: false,
        participatesInInitiative,
        sortOrder: maxSortOrder + 1,
        createdAt: new Date(),
        updatedAt: null,
        archivedAt: null,
      } as unknown as ListModel;

      if (!old) return [optimisticList];
      return [...old, optimisticList];
    },
    successMessage: 'List created',
    errorMessage: 'Failed to create list',
  });
}

export function useUpdateListMutation() {
  return useOptimisticMutation({
    mutationFn: async ({ id, name, description, participatesInInitiative, color }: { id: string; name: string; description?: string | null; participatesInInitiative: boolean; color?: string | null }) => {
      const response = (await fetchBackend('update-list', { id, name, description, participatesInInitiative, color })) as ListPlain;
      return ListModel.toInstance(response);
    },
    queryKey: listKeys.all,
    optimisticUpdate: (old, { id, name, description, participatesInInitiative, color }) => {
      if (!old) return [];
      return old.map((list) =>
        list.id === id ? cloneInstance(list, { name, ...(description !== undefined && { description }), ...(color !== undefined && { color }), participatesInInitiative, updatedAt: new Date() } as Partial<ListModel>) : list
      );
    },
    successMessage: 'List updated',
    errorMessage: 'Failed to update list',
  });
}

export function useArchiveListMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const response = (await fetchBackend('update-list', { id, archived })) as ListPlain;
      return ListModel.toInstance(response);
    },
    onSuccess: (_data, { archived }) => {
      toast.success(archived ? 'List archived' : 'List unarchived');
      queryClient.invalidateQueries({ queryKey: listKeys.all });
    },
    onError: () => {
      toast.error('Failed to update list archive status');
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useReorderListsMutation() {
  return useOptimisticMutation({
    mutationFn: async (listIds: string[]) => {
      const response = await fetch('/api/reorder-lists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listIds }),
      });
      if (!response.ok) {
        throw new Error('Failed to reorder lists');
      }
      return response.json();
    },
    queryKey: listKeys.all,
    optimisticUpdate: (old, listIds) => {
      if (!old) return [];
      const listMap = new Map(old.map((list) => [list.id, list]));
      return listIds
        .map((id) => listMap.get(id))
        .filter((list): list is ListModel => list !== undefined)
        .map((list, index) => cloneInstance(list, { sortOrder: index } as Partial<ListModel>));
    },
    errorMessage: 'Failed to reorder lists',
  });
}
