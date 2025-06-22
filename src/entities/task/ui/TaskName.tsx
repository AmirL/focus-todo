import { TaskModel, isTaskDeleted } from '@/entities/task/model/task';
import { cn } from '@/shared/lib/utils';

interface TaskNameProps {
  task: TaskModel;
}

export function TaskName({ task }: TaskNameProps) {
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