import { useState, ReactNode } from 'react';
import { isTaskSelected, TaskModel, isTaskDeleted } from '@/entities/task/model/task';
import { Checkbox } from '@/shared/ui/checkbox';
import { cn } from '@/shared/lib/utils';
import { useToggleTaskCompleted } from '../model/toggleCompleted';
import { CollapsibleActions } from '@/shared/ui/collapsible-actions';
import { TaskBadges } from './TaskBadges';
import { TaskDetails, DescriptionIndicator } from './TaskDetails';
import { TaskName } from './TaskName';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { toggleMarkdownCheckbox } from '@/shared/lib/toggleMarkdownCheckbox';
import { createInstance } from '@/shared/lib/instance-tools';

interface TaskProps {
  task: TaskModel;
  actionButtons: JSX.Element;
  isDragging?: boolean;
  dragHandle?: JSX.Element;
  /** Slot for the estimated-time feature button */
  estimatedTimeSlot?: ReactNode;
  /** Whether this task is highlighted via temp-select */
  isTempSelected?: boolean;
  /** Called when the user clicks the task body to toggle selection. If omitted, click-to-select is disabled. */
  onToggleSelection?: () => void;
  /** Hide "Today" badge (e.g. when already on the Today tab) */
  hideTodayBadge?: boolean;
  /** Hide future-date badge (e.g. when on the Tomorrow tab) */
  hideDateBadge?: boolean;
}

export function Task({
  task,
  actionButtons,
  isDragging = false,
  dragHandle,
  estimatedTimeSlot,
  isTempSelected = false,
  onToggleSelection,
  hideTodayBadge,
  hideDateBadge,
}: TaskProps) {
  const isSelected = isTaskSelected(task);
  const deleted = isTaskDeleted(task);
  const toggleTaskCompleted = useToggleTaskCompleted();
  const updateTaskMutation = useUpdateTaskMutation();
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const handleCheckboxToggle = (checkboxIndex: number) => {
    const newDetails = toggleMarkdownCheckbox(task.details, checkboxIndex);
    const updatedTask = createInstance(TaskModel, { ...task, details: newDetails, updatedAt: new Date() });
    updateTaskMutation.mutate(updatedTask);
  };

  const onCheckboxClick = async () => {
    if (deleted) return;
    toggleTaskCompleted.mutate(task);
  };

  const handleTaskClick = (e: React.MouseEvent<HTMLLIElement>) => {
    if (!onToggleSelection) return;
    if (deleted) return;

    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('[data-testid="task-details"]')
    ) {
      return;
    }

    onToggleSelection();
  };

  return (
    <li
      key={task.id}
      onClick={handleTaskClick}
      className={cn(
        'group relative transition-all duration-300 overflow-hidden bg-white border-b border-border/50',
        task.completedAt ? 'opacity-60' : '',
        isSelected && !task.completedAt && 'border-l-4 border-l-yellow-400',
        deleted && 'opacity-50',
        isDragging && 'opacity-30 shadow-lg scale-105 z-50',
        !deleted && 'cursor-pointer',
        isTempSelected && 'bg-blue-50 hover:bg-blue-100'
      )}
      data-testid={`task-${task.id}`}
    >
      <div className="px-2 sm:px-4 py-3">
        <div className="flex items-center space-x-2 sm:space-x-3">
          {dragHandle && (
            <div className="flex-shrink-0">
              {dragHandle}
            </div>
          )}
          <Checkbox
            id={`todo-${task.id}`}
            checked={!!task.completedAt}
            onCheckedChange={onCheckboxClick}
            disabled={deleted}
          />
          <TaskName task={task} />
        </div>
        <div className="flex justify-between items-center mt-2 gap-2">
          <div className="flex space-x-2 items-center min-w-0 flex-shrink overflow-hidden">
            <TaskBadges task={task} hideTodayBadge={hideTodayBadge} hideDateBadge={hideDateBadge} />
            {task.details?.trim() && (
              <DescriptionIndicator
                details={task.details}
                expanded={detailsExpanded}
                onClick={() => setDetailsExpanded(!detailsExpanded)}
              />
            )}
            {estimatedTimeSlot}
          </div>
          <div className="flex-shrink-0">
            <CollapsibleActions>
              {actionButtons}
            </CollapsibleActions>
          </div>
        </div>
        {task.details?.trim() && (
          <TaskDetails
            details={task.details}
            expanded={detailsExpanded}
            onCollapse={() => setDetailsExpanded(false)}
            onCheckboxToggle={handleCheckboxToggle}
          />
        )}
      </div>
    </li>
  );
}
