import { useTasksStore } from '@/entities/task/model/tasksStore';
import { useEffect } from 'react';
import { useApplyFilters } from './Filters';
import { Task } from '@/entities/task/ui/Task';

export function Tasks() {
  const fetchTasks = useTasksStore((state) => state.fetchTasks);
  const allTasks = useTasksStore((state) => state.tasks);
  const isLoading = useTasksStore((state) => state.isLoading);

  const tasks = useApplyFilters(allTasks);

  useEffect(() => {
    if (allTasks.length === 0) fetchTasks();

    // Set up an interval to fetch tasks periodically
    const intervalId = setInterval(() => {
      fetchTasks();
    }, 60000); // Fetch tasks every 60 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchTasks, allTasks.length]);

  if (isLoading && allTasks.length === 0) {
    return <div className="flex justify-center items-center h-5">Loading...</div>;
  }

  if (tasks.length === 0) {
    return <p className="text-center text-muted-foreground">No tasks found.</p>;
  }

  console.log('Rendering tasks');
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <Task key={task.id} task={task} />
      ))}
    </ul>
  );
}
