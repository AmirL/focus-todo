import { useCreateListMutation, useUpdateListMutation, useDeleteListMutation } from '@/shared/api/lists';

export function useListActions() {
  const createListMutation = useCreateListMutation();
  const updateListMutation = useUpdateListMutation();
  const deleteListMutation = useDeleteListMutation();

  const createList = async (name: string) => {
    if (!name.trim()) return false;
    
    try {
      await createListMutation.mutateAsync(name.trim());
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateList = async (id: string, name: string) => {
    if (!name.trim()) return false;
    
    try {
      await updateListMutation.mutateAsync({ id, name: name.trim() });
      return true;
    } catch (error) {
      return false;
    }
  };

  const deleteList = async (id: string) => {
    try {
      await deleteListMutation.mutateAsync({ id });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    createList,
    updateList,
    deleteList,
    isCreating: createListMutation.isPending,
    isUpdating: updateListMutation.isPending,
    isDeleting: deleteListMutation.isPending,
  };
}