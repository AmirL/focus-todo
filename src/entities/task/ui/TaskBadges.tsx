import { Badge } from '@/shared/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { AlertTriangle } from 'lucide-react';
import { TaskModel, isTaskDeleted, isTaskOverdue } from '@/entities/task/model/task';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { StatusFilterEnum, useFilterStore } from '@/features/tasks/filter/model/filterStore';
import { useSidebar } from '@/shared/ui/sidebar';
import { cn, isFutureDate, isToday } from '@/shared/lib/utils';
import dayjs from 'dayjs';

interface TaskBadgesProps {
  task: TaskModel;
}

export function TaskBadges({ task }: TaskBadgesProps) {
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