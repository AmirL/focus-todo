import { Badge } from '@/shared/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { AlertTriangle } from 'lucide-react';
import { TaskModel, isTaskDeleted, isTaskOverdue } from '@/entities/task/model/task';
import { isFutureDate, isToday } from '@/shared/lib/utils';
import dayjs from 'dayjs';

interface TaskBadgesProps {
  task: TaskModel;
  /** Hide "Today" badge when on Today tab */
  hideTodayBadge?: boolean;
  /** Hide date badge when on Tomorrow tab */
  hideDateBadge?: boolean;
}

export function TaskBadges({ task, hideTodayBadge = false, hideDateBadge = false }: TaskBadgesProps) {
  // Hide redundant date badges when on Today/Tomorrow tabs
  const isOnTodayTab = hideTodayBadge;
  const isOnTomorrowTab = hideDateBadge;

  return (
    <>
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
