import { useDeleteListMutation } from '@/shared/api/lists';

export function useDeleteList() {
  const deleteListMutation = useDeleteListMutation();

  const deleteList = async (id: string) => {
    try {
      await deleteListMutation.mutateAsync({ id });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    deleteList,
    isDeleting: deleteListMutation.isPending,
  };
}