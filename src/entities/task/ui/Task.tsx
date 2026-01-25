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
import { useFilterStore, StatusFilterEnum } from '@/features/tasks/filter/model/filterStore';

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
  const { statusFilter } = useFilterStore();

  const onCheckboxClick = async () => {
    if (deleted) return;
    toggleTaskCompleted.mutate(task);
  };

  const handleTaskClick = (e: React.MouseEvent<HTMLLIElement>) => {
    // Don't select if task is deleted
    if (deleted) return;

    // Only allow selection in the Selected filter
    if (statusFilter !== StatusFilterEnum.SELECTED) return;

    // Check if click was on an interactive element
    const target = e.target as HTMLElement;

    // Exclude clicks on buttons, links, inputs, and task details
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input') ||
      target.closest('[data-testid="task-details"]')
    ) {
      return;
    }

    // Toggle temporary selection
    toggleSelection(task.id);
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
        isTempSelectedTask && 'bg-blue-50 hover:bg-blue-100'
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
        <TaskDetails details={task.details} />
        <div className="flex justify-between items-center mt-2 gap-2">
          <div className="flex space-x-2 items-center min-w-0 flex-shrink overflow-hidden">
            <TaskBadges task={task} />
            <EstimatedTimeButton task={task} />
          </div>
          <div className="flex-shrink-0">
            <CollapsibleActions>
              {actionButtons}
            </CollapsibleActions>
          </div>
        </div>
      </div>
    </li>
  );
}

