import { useCreateListMutation } from '@/shared/api/lists';

export function useCreateList() {
  const createListMutation = useCreateListMutation();

  const createList = async (name: string) => {
    if (!name.trim()) return false;
    
    try {
      await createListMutation.mutateAsync(name.trim());
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