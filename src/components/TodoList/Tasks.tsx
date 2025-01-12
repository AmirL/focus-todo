import { useTasksStore } from '@/store/tasksStore';
import { useEffect } from 'react';
import { TaskRow } from '../Task';
import { useApplyFilters } from './Filters';

export function Tasks() {
  const fetchTasks = useTasksStore((state) => state.fetchTasks);
  const allTasks = useTasksStore((state) => state.tasks);

  const tasks = useApplyFilters(allTasks);

  useEffect(() => {
    if (allTasks.length === 0) fetchTasks();
  }, [fetchTasks, allTasks.length]);

  const isLoading = useTasksStore((state) => state.isLoading);

  if (isLoading) {
    return <div className="flex justify-center items-center h-5">Loading...</div>;
  }

  if (tasks.length === 0) {
    return <p className="text-center text-muted-foreground">No tasks found.</p>;
  }

  console.log('Rendering tasks');
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </ul>
  );
}
