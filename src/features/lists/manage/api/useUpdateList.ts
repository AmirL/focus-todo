import { useUpdateListMutation } from '@/shared/api/lists';

export function useUpdateList() {
  const updateListMutation = useUpdateListMutation();

  const updateList = async (id: string, name: string) => {
    if (!name.trim()) return false;
    
    try {
      await updateListMutation.mutateAsync({ id, name: name.trim() });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    updateList,
    isUpdating: updateListMutation.isPending,
  };
}