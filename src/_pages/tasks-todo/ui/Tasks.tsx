import { useApplyFilters } from '../model/filterTasks';
import { useSortedTasks } from '../model/sortTasks';
import { Task } from '@/entities/task/ui/Task';
import { useTasksLoader } from '../api/useTasksLoader';
import { EditTaskButton } from '@/features/tasks/edit/ui/EditTaskButton';
import { DeleteButton } from '@/features/tasks/actions/ui/DeleteButton';
import { ReAddButton } from '@/features/tasks/actions/ui/ReAddButton';
import { SnoozeButton } from '@/features/tasks/actions/ui/SnoozeButton';
import { StarButton } from '@/features/tasks/actions/ui/StarButton';
import { BlockerButton } from '@/features/tasks/actions/ui/BlockerButton';

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

  return (
    <section>
      <ul>
        {tasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            actionButtons={
              <>
                <EditTaskButton key="edit" task={task} />
                <BlockerButton task={task} />
                <StarButton task={task} />
                <SnoozeButton task={task} />
                <ReAddButton task={task} />
                <DeleteButton task={task} />
              </>
            }
          />
        ))}
      </ul>
    </section>
  );
}
