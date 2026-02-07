import { useArchiveListMutation } from '@/shared/api/lists';

export function useArchiveList() {
  const archiveListMutation = useArchiveListMutation();

  const archiveList = async (id: string) => {
    try {
      await archiveListMutation.mutateAsync({ id, archived: true });
      return true;
    } catch {
      return false;
    }
  };

  const unarchiveList = async (id: string) => {
    try {
      await archiveListMutation.mutateAsync({ id, archived: false });
      return true;
    } catch {
      return false;
    }
  };

  return {
    archiveList,
    unarchiveList,
    isArchiving: archiveListMutation.isPending,
  };
}
