import { isTaskSelected, TaskModel, isTaskDeleted } from '@/entities/task/model/task';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { cn, isFutureDate, isToday } from '@/shared/lib/utils';
import dayjs from 'dayjs';
import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { toggleCompleted } from '../model/toggleCompleted';

// Helper function to format duration
function formatDuration(minutes: number | null | undefined): string | null {
  if (minutes === null || minutes === undefined || minutes <= 0) {
    return null;
  }
  if (minutes === 15) return '15 min';
  if (minutes === 30) return '30 min';
  if (minutes === 60) return '1 hour';
  if (minutes === 90) return '1.5 hours';
  if (minutes === 150) return '2.5 hours';
  if (minutes === 240) return '4 hours';
  if (minutes === 480) return '1 day'; // Updated from 390 to 480 to match dropdown
  if (minutes === 390) return '1 day'; // Keep this for compatibility with existing tasks

  // Fallback for other values (optional)
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  let formatted = '';
  if (hours > 0) {
    formatted += `${hours}h`;
  }
  if (remainingMinutes > 0) {
    formatted += `${remainingMinutes}m`;
  }
  return formatted || null; // Return null if formatted is empty (e.g., minutes=0)
}

interface TaskProps {
  task: TaskModel;
  actionButtons: JSX.Element;
}

export function Task({ task, actionButtons }: TaskProps) {
  const isSelected = isTaskSelected(task);
  const deleted = isTaskDeleted(task);

  const onCheckboxClick = async () => {
    if (deleted) return;
    await toggleCompleted(task);
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
            {task.estimatedDuration && (
              <Badge variant="outline" className="font-normal">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                {formatDuration(task.estimatedDuration)}
              </Badge>
            )}
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
