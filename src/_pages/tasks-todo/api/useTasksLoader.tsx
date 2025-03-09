import { useTasksStore } from '@/entities/task/model/tasksStore';
import { useShallow } from 'zustand/react/shallow';

import { useEffect } from 'react';
import { fetchBackend } from '@/shared/lib/api';
import { TaskPlain, TaskModel } from '@/entities/task/model/task';

export function useTasksLoader() {
  const allTasks = useTasksStore((state) => state.tasks);
  const { isLoading, setLoading, syncTasks } = useTasksStore(
    useShallow((state) => ({ isLoading: state.isLoading, setLoading: state.setLoading, syncTasks: state.syncTasks }))
  );

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const data = (await fetchBackend('get-tasks')) as { tasks: TaskPlain[] };
      const fetchedTasks = TaskModel.fromPlainArray(data.tasks);
      syncTasks(fetchedTasks);
      setLoading(false);
    };

    fetchTasks();

    // Set up an interval to fetch tasks periodically
    const intervalId = setInterval(fetchTasks, 60000); // Fetch tasks every 60 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [setLoading, syncTasks]);

  return { allTasks, isLoading };
}
