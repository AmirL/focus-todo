import { TaskModel, isTaskDeleted } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { Trash2, Undo2 } from 'lucide-react';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { createInstance } from '@/shared/lib/instance-tools';

export function DeleteButton({ task }: { task: TaskModel }) {
  const updateTaskMutation = useUpdateTaskMutation();
  const isDeleted = isTaskDeleted(task);

  const handleDelete = async () => {
    const deletedAt = isDeleted ? null : new Date();
    const updatedTask = createInstance(TaskModel, { ...task, deletedAt, updatedAt: new Date() });
    updateTaskMutation.mutate(updatedTask);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      className={`h-8 w-8 ${
        isDeleted 
          ? 'text-muted-foreground hover:text-green-600' 
          : 'text-muted-foreground hover:text-destructive'
      }`}
      data-testid={`delete-task-${task.id}`}
    >
      {isDeleted ? <Undo2 className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
