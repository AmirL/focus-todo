import { Task } from '@/classes/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { format, isFuture, isSameDay, parseISO } from 'date-fns';
import { useTasksStore } from '@/store/tasksStore';
import { StarButton } from './TaskButtons/StarButton';
import { DeleteButton } from './TaskButtons/DeleteButton';
import { ReAddButton } from './TaskButtons/ReAddButton';
import { SnoozeButton } from './TaskButtons/SnoozeButton';

export function TaskRow({ task }: { task: Task }) {
  const { updateTask } = useTasksStore();

  const toggleCompleted = () => {
    const completedAt = task.completedAt ? null : new Date().toISOString();
    updateTask(task.id, { completedAt });
  };

  return (
    <li key={task.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
      <div className="flex items-center space-x-2">
        <Checkbox id={`todo-${task.id}`} checked={!!task.completedAt} onCheckedChange={toggleCompleted} />
        <TaskName task={task} />
        <TaskBadges task={task} />
      </div>
      <div className="flex space-x-1">
        <StarButton task={task} />
        <SnoozeButton task={task} />
        <ReAddButton task={task} />
        <DeleteButton task={task} />
      </div>
    </li>
  );
}

export function TaskName({ task }: { task: Task }) {
  return (
    <label
      htmlFor={`todo-${task.id}`}
      className={`${task.completedAt ? 'line-through text-muted-foreground' : 'text-primary'}`}
    >
      {task.name}
    </label>
  );
}

export function TaskBadges({ task }: { task: Task }) {
  return (
    <>
      <Badge variant="secondary">{task.list}</Badge>
      {task.date && isSameDay(parseISO(task.date), new Date()) && <Badge variant="default">Today</Badge>}
      {task.date && isFuture(parseISO(task.date)) && (
        <Badge variant="outline">Snoozed: {format(parseISO(task.date), 'yyyy-MM-dd')}</Badge>
      )}
    </>
  );
}
