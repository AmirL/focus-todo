import { useTasksQuery } from '@/shared/api/tasks';

export function useTasksLoader() {
  const { data: allTasks = [], isLoading, error } = useTasksQuery();

  return { allTasks, isLoading, error };
}
