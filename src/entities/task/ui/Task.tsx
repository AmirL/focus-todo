import { isTaskSelected, TaskModel, isTaskDeleted, isTaskOverdue } from '@/entities/task/model/task';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { cn, isFutureDate, isToday } from '@/shared/lib/utils';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { useToggleTaskCompleted } from '../model/toggleCompleted';
import { EstimatedTimeButton } from '@/features/tasks/actions/ui/EstimatedTimeButton';
import { StatusFilterEnum, useFilterStore } from '@/features/tasks/filter/model/filterStore';
import { useSidebar } from '@/shared/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { AlertTriangle } from 'lucide-react';

interface TaskProps {
  task: TaskModel;
  actionButtons: JSX.Element;
}

export function Task({ task, actionButtons }: TaskProps) {
  const isSelected = isTaskSelected(task);
  const deleted = isTaskDeleted(task);
  const toggleTaskCompleted = useToggleTaskCompleted();

  const onCheckboxClick = async () => {
    if (deleted) return;
    toggleTaskCompleted.mutate(task);
  };

  return (
    <li
      key={task.id}
      className={cn(
        'group relative transition-all duration-300 overflow-hidden bg-white border-b border-border/50',
        task.completedAt ? 'opacity-60' : '',
        isSelected && !task.completedAt && 'border-l-4 border-l-yellow-400',
        deleted && 'opacity-50'
      )}
    >
      <div className="px-4 py-3">
        <div className="flex items-center space-x-3">
          <Checkbox
            id={`todo-${task.id}`}
            checked={!!task.completedAt}
            onCheckedChange={onCheckboxClick}
            disabled={deleted}
          />
          <TaskName task={task} />
        </div>
        <TaskDetails details={task.details} />
        <div className="flex justify-between items-center mt-2">
          <div className="flex space-x-2 items-center">
            <TaskBadges task={task} />
            <EstimatedTimeButton task={task} />
          </div>
          {!deleted && (
            <div className="flex space-x-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {actionButtons}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function TaskName({ task }: { task: TaskModel }) {
  const deleted = isTaskDeleted(task);
  return (
    <label
      htmlFor={`todo-${task.id}`}
      className={cn(
        'flex-1 cursor-pointer font-medium',
        task.completedAt && 'line-through text-muted-foreground',
        deleted && 'line-through'
      )}
    >
      {task.name}
    </label>
  );
}

function TaskBadges({ task }: { task: TaskModel }) {
  const showTaskList = useTasksStore((store) => store.showTaskList);
  const { statusFilter } = useFilterStore();
  const { isMobile } = useSidebar();

  // Hide redundant date badges when on Today/Tomorrow tabs
  const isOnTodayTab = statusFilter === StatusFilterEnum.TODAY;
  const isOnTomorrowTab = statusFilter === StatusFilterEnum.TOMORROW;

  // Show abbreviated list name on mobile
  const listDisplayName = isMobile ? task.list.charAt(0) : task.list;

  return (
    <>
      {showTaskList && <Badge variant="secondary">{listDisplayName}</Badge>}
      {/* Hide "Today" badge when already on Today tab */}
      {isToday(task.date) && !isOnTodayTab && <Badge variant="default">Today</Badge>}
      {/* Hide date badges when on Tomorrow tab */}
      {task.date && isFutureDate(task.date) && !isOnTomorrowTab && <Badge variant="outline">{dayjs(task.date).format('DD.MM.YY')}</Badge>}
      {/* Show overdue indicator */}
      {isTaskOverdue(task) && !isTaskDeleted(task) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className="text-red-50 bg-red-600 px-1.5 py-0.5">
              <AlertTriangle className="h-3 w-3" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Overdue: {dayjs(task.date).format('DD.MM.YY')}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}

function TaskDetails({ details }: { details: string }) {
  const [folded, setFolded] = useState(true);

  if (!details) return <></>;

  return (
    <div onClick={() => setFolded(!folded)} className="mt-1">
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
