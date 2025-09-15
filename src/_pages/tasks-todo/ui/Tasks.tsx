import { useApplyFilters } from '@/features/tasks/filter/model/filterTasks';
import { useSortedTasks } from '../model/sortTasks';
import { useTasksLoader } from '../api/useTasksLoader';
import { useGroupedTasksByList } from '../model/groupTasks';
import { ErrorState } from './ErrorState';
import { TaskWithActions } from './TaskWithActions';

export function Tasks() {
  const { allTasks, isLoading, error } = useTasksLoader();

  const filteredTasks = useApplyFilters(allTasks);
  const tasks = useSortedTasks(filteredTasks);
  const groups = useGroupedTasksByList(tasks);

  if (error) return <ErrorState title="Error loading tasks" error={error} />;

  if (isLoading && allTasks.length === 0) {
    return <div className="flex justify-center items-center h-5">Loading...</div>;
  }

  if (tasks.length === 0) {
    return <p className="text-center text-muted-foreground">No tasks found.</p>;
  }

  return (
    <section className="pb-20">
      {groups.map((group) => (
        <div key={group.name} className="mt-16 first:mt-0">
          <h3 className="px-4 text-base font-semibold text-primary">{group.name}</h3>
          <ul>
            {group.tasks.map((task) => (
              <TaskWithActions key={task.id} task={task} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
