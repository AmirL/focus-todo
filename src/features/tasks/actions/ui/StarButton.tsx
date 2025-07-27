import { isTaskSelected, TaskModel } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { createInstance } from '@/shared/lib/instance-tools';

export function StarButton({ task }: { task: TaskModel }) {
  const updateTaskMutation = useUpdateTaskMutation();
  const isSelected = isTaskSelected(task);

  const toggleTodayTask = async (task: TaskModel) => {
    const selectedAt = isSelected ? null : new Date();
    const updatedTask = createInstance(TaskModel, { ...task, selectedAt, updatedAt: new Date() });
    updateTaskMutation.mutate(updatedTask);
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
      data-testid={`star-task-${task.id}`}
    >
      <Star fill={isSelected ? '#E3B644' : 'none'} className="h-4 w-4" />
    </Button>
  );
}
