import { Badge } from '@/shared/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { TaskModel, isTaskDeleted, isTaskOverdue } from '@/entities/task/model/task';
import { StatusFilterEnum, useFilterStore } from '@/features/tasks/filter/model/filterStore';
import { isFutureDate, isToday } from '@/shared/lib/utils';
import { hasPendingSuggestions } from '@/shared/lib/aiSuggestions';
import dayjs from 'dayjs';

interface TaskBadgesProps {
  task: TaskModel;
}

export function TaskBadges({ task }: TaskBadgesProps) {
  const { statusFilter } = useFilterStore();

  // Hide redundant date badges when on Today/Tomorrow tabs
  const isOnTodayTab = statusFilter === StatusFilterEnum.TODAY;
  const isOnTomorrowTab = statusFilter === StatusFilterEnum.TOMORROW;

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
      {/* Show AI suggestions indicator */}
      {hasPendingSuggestions(task.aiSuggestions, {
        name: task.name,
        details: task.details,
        estimatedDuration: task.estimatedDuration,
      }) && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-1.5 py-0.5" data-cy="ai-suggestion-badge">
              <Sparkles className="h-3 w-3" />
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI suggestions available</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
