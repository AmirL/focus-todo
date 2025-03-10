import { isTaskSelected, TaskModel } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { Star } from 'lucide-react';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { cn } from '@/shared/lib/utils';
import { updateTaskMutation } from '@/shared/api/updateTask.mutation';

export function StarButton({ task }: { task: TaskModel }) {
  const updateTask = useTasksStore((state) => state.updateTask);

  const isSelected = isTaskSelected(task);

  const toggleTodayTask = async (task: TaskModel) => {
    const selectedAt = isSelected ? null : new Date();
    const updatedTask = updateTask(task.id, { selectedAt });
    await updateTaskMutation(updatedTask);
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
    >
      <Star fill={isSelected ? '#E3B644' : 'none'} className="h-4 w-4" />
    </Button>
  );
}
