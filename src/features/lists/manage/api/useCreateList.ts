import { useCreateListMutation } from '@/shared/api/lists';

export function useCreateList() {
  const createListMutation = useCreateListMutation();

  const createList = async (name: string, participatesInInitiative: boolean = true, description?: string | null, color?: string | null) => {
    if (!name.trim()) return false;

    try {
      await createListMutation.mutateAsync({ name: name.trim(), description: description?.trim() || null, participatesInInitiative, color: color ?? null });
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    createList,
    isCreating: createListMutation.isPending,
  };
}
