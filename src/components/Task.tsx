import { Task } from '@/classes/task';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useTasksStore } from '@/store/tasksStore';
import { StarButton } from './TaskButtons/StarButton';
import { DeleteButton } from './TaskButtons/DeleteButton';
import { ReAddButton } from './TaskButtons/ReAddButton';
import { SnoozeButton } from './TaskButtons/SnoozeButton';
import { useFilterStore } from '@/store/filterStore';
import { cn, isFutureDate, isToday } from '@/lib/utils';
import dayjs from 'dayjs';
import { EditTaskButton } from './TaskButtons/EditTaskButton';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';

export function TaskRow({ task }: { task: Task }) {
  const { updateTask } = useTasksStore();

  const toggleCompleted = () => {
    const completedAt = task.completedAt ? null : new Date();
    updateTask(task.id, { completedAt });
  };

  return (
    <li key={task.id} className="flex flex-col  p-2 pt-4 pb-1 bg-muted rounded-md gap-2">
      <div className="flex items-center space-x-2">
        <Checkbox id={`todo-${task.id}`} checked={!!task.completedAt} onCheckedChange={toggleCompleted} />
        <TaskName task={task} />
      </div>
      <TaskDetails details={task.details} />
      <div className="flex justify-between">
        <div className="flex space-x-1">
          <TaskBadges task={task} />
        </div>
        <div className="flex space-x-1">
          <EditTaskButton task={task} />
          <StarButton task={task} />
          <SnoozeButton task={task} />
          <ReAddButton task={task} />
          <DeleteButton task={task} />
        </div>
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
  const { list } = useFilterStore();
  return (
    <>
      {list === '' && <Badge variant="secondary">{task.list}</Badge>}
      {isToday(task.date) && <Badge variant="default">Today</Badge>}
      {isFutureDate(task.date) && <Badge variant="outline">Snoozed: {dayjs(task.date).format('DD.MM.YY')}</Badge>}
    </>
  );
}

function TaskDetails({ details }: { details: string }) {
  const [folded, setFolded] = useState(true);

  if (!details) return <></>;

  return (
    <div onClick={() => setFolded(!folded)}>
      <ReactMarkdown
        className={cn(
          'prose prose-sm text-muted-foreground cursor-pointer',
          folded ? 'line-clamp-1' : 'line-clamp-none'
        )}
      >
        {details}
      </ReactMarkdown>
    </div>
  );
}
