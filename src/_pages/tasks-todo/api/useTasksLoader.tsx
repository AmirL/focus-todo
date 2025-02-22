import { useTasksStore } from '@/shared/model/tasksStore';
import { useEffect } from 'react';

export function useTasksLoader() {
  const fetchTasks = useTasksStore((state) => state.fetchTasks);
  const allTasks = useTasksStore((state) => state.tasks);
  const isLoading = useTasksStore((state) => state.isLoading);

  useEffect(() => {
    if (allTasks.length === 0) fetchTasks();

    // Set up an interval to fetch tasks periodically
    const intervalId = setInterval(() => {
      fetchTasks();
    }, 60000); // Fetch tasks every 60 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchTasks, allTasks.length]);
  return { allTasks, isLoading };
}
