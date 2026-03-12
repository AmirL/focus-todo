import { useUpdateListMutation } from '@/shared/api/lists';

export function useUpdateList() {
  const updateListMutation = useUpdateListMutation();

  const updateList = async (id: string, name: string, participatesInInitiative: boolean, description?: string | null, color?: string | null) => {
    if (!name.trim()) return false;

    try {
      await updateListMutation.mutateAsync({ id, name: name.trim(), description: description?.trim() || null, participatesInInitiative, color: color ?? null });
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
