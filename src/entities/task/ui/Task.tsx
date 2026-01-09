import { isTaskSelected, TaskModel, isTaskDeleted } from '@/entities/task/model/task';
import { Checkbox } from '@/shared/ui/checkbox';
import { cn } from '@/shared/lib/utils';
import { useToggleTaskCompleted } from '../model/toggleCompleted';
import { EstimatedTimeButton } from '@/features/tasks/actions/ui/EstimatedTimeButton';
import { CollapsibleActions } from '@/shared/ui/collapsible-actions';
import { TaskBadges } from './TaskBadges';
import { TaskDetails } from './TaskDetails';
import { TaskName } from './TaskName';
import { useTempSelectStore } from '@/features/tasks/temp-select';

interface TaskProps {
  task: TaskModel;
  actionButtons: JSX.Element;
  isDragging?: boolean;
  dragHandle?: JSX.Element;
}

export function Task({ task, actionButtons, isDragging = false, dragHandle }: TaskProps) {
  const isSelected = isTaskSelected(task);
  const deleted = isTaskDeleted(task);
  const toggleTaskCompleted = useToggleTaskCompleted();

  const { toggleSelection, isSelected: isTempSelected } = useTempSelectStore();
  const isTempSelectedTask = isTempSelected(task.id);

  const onCheckboxClick = async () => {
    if (deleted) return;
    toggleTaskCompleted.mutate(task);
  };

  const handleTaskClick = (e: React.MouseEvent<HTMLLIElement>) => {
    // Prevent selection when clicking interactive elements
    const target = e.target as HTMLElement;
    const isInteractive =
      target.closest('button') ||
      target.closest('input') ||
      target.closest('a') ||
      target.closest('[data-testid="task-details"]');

    if (!isInteractive && !deleted) {
      toggleSelection(task.id);
    }
  };

  return (
    <li
      key={task.id}
      onClick={handleTaskClick}
      className={cn(
        'group relative transition-all duration-300 overflow-hidden bg-white border-b border-border/50',
        task.completedAt ? 'opacity-60' : '',
        isSelected && !task.completedAt && 'border-l-4 border-l-yellow-400',
        isTempSelectedTask && !task.completedAt && 'bg-blue-50 hover:bg-blue-100',
        deleted && 'opacity-50',
        isDragging && 'opacity-30 shadow-lg scale-105 z-50',
        !deleted && 'cursor-pointer'
      )}
      data-testid={`task-${task.id}`}
    >
      <div className="px-4 py-3">
        <div className="flex items-center space-x-3">
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
        <TaskDetails details={task.details} />
        <div className="flex justify-between items-center mt-2">
          <div className="flex space-x-2 items-center">
            <TaskBadges task={task} />
            <EstimatedTimeButton task={task} />
          </div>
          <CollapsibleActions>
            {actionButtons}
          </CollapsibleActions>
        </div>
      </div>
    </li>
  );
}

