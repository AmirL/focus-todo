import { TaskModel, isTaskDeleted } from '@/entities/task/model/task';
import { cn } from '@/shared/lib/utils';

interface TaskNameProps {
  task: TaskModel;
}

export function TaskName({ task }: TaskNameProps) {
  const deleted = isTaskDeleted(task);
  
  return (
    <div
      className={cn(
        'flex-1 min-w-0 font-medium break-words overflow-hidden',
        task.completedAt && 'line-through text-muted-foreground',
        deleted && 'line-through'
      )}
    >
      {task.name}
    </div>
  );
}