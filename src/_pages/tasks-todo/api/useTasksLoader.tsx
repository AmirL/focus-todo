import { useTasksQuery } from '@/shared/api/tasks';

export function useTasksLoader() {
  const { data: allTasks = [], isLoading } = useTasksQuery();

  return { allTasks, isLoading };
}
