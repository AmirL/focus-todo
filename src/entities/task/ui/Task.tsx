import { isTaskSelected, TaskModel } from '@/entities/task/model/task';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { cn, isFutureDate, isToday } from '@/shared/lib/utils';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { toggleCompleted } from '../model/toggleCompleted';

interface TaskProps {
  task: TaskModel;
  actionButtons: JSX.Element;
}

export function Task({ task, actionButtons }: TaskProps) {
  const isSelected = isTaskSelected(task);

  const onCheckboxClick = async () => {
    await toggleCompleted(task);
  };

  return (
    <li
      key={task.id}
      className={cn(
        'group relative rounded-lg transition-all duration-300 overflow-hidden',
        task.completedAt ? 'bg-muted/50' : 'bg-muted/80 hover:bg-muted',
        isSelected && !task.completedAt && 'border-l-4 border-l-yellow-400'
      )}
    >
      <div className="p-3 pb-2">
        <div className="flex items-center space-x-2">
          <Checkbox id={`todo-${task.id}`} checked={!!task.completedAt} onCheckedChange={onCheckboxClick} />
          <TaskName task={task} />
        </div>
        <TaskDetails details={task.details} />
        <div className="flex justify-between">
          <div className="flex space-x-1">
            <TaskBadges task={task} />
          </div>
          <div className="flex space-x-1">{actionButtons}</div>
        </div>
      </div>
    </li>
  );
}

function TaskName({ task }: { task: TaskModel }) {
  return (
    <label
      htmlFor={`todo-${task.id}`}
      className={cn('flex-1 cursor-pointer', task.completedAt && 'line-through text-muted-foreground')}
    >
      {task.name}
    </label>
  );
}

function TaskBadges({ task }: { task: TaskModel }) {
  const showTaskList = useTasksStore((store) => store.showTaskList);

  return (
    <>
      {showTaskList && <Badge variant="secondary">{task.list}</Badge>}
      {isToday(task.date) && <Badge variant="default">Today</Badge>}
      {task.date && isFutureDate(task.date) && <Badge variant="outline">{dayjs(task.date).format('DD.MM.YY')}</Badge>}
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
