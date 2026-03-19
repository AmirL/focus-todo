import { isTaskSelected, TaskModel } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { buildToggledStarTask } from '../lib/taskActionUtils';

export function StarButton({ task }: { task: TaskModel }) {
  const updateTaskMutation = useUpdateTaskMutation();
  const isSelected = isTaskSelected(task);

  const toggleTodayTask = (task: TaskModel) => {
    updateTaskMutation.mutate(buildToggledStarTask(task));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggleTodayTask(task)}
      className={cn(
        'h-8 w-8',
        isSelected ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground hover:text-yellow-500'
      )}
      data-cy={`star-task-${task.id}`}
    >
      <Star fill={isSelected ? '#E3B644' : 'none'} className="h-4 w-4" />
    </Button>
  );
}
