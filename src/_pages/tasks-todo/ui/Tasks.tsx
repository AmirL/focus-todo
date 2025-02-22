import { useApplyFilters, useSortedTasks } from './Filters';
import { Task } from '@/entities/task/ui/Task';
import { useTasksLoader } from '../api/useTasksLoader';

export function Tasks() {
  const { allTasks, isLoading } = useTasksLoader();

  const filteredTasks = useApplyFilters(allTasks);
  const tasks = useSortedTasks(filteredTasks);

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
