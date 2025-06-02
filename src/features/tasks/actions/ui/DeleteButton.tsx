import { TaskModel } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { Trash2 } from 'lucide-react';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { createInstance } from '@/shared/lib/instance-tools';

export function DeleteButton({ task }: { task: TaskModel }) {
  const updateTaskMutation = useUpdateTaskMutation();

  const handleDelete = async () => {
    const updatedTask = createInstance(TaskModel, { ...task, deletedAt: new Date(), updatedAt: new Date() });
    updateTaskMutation.mutate(updatedTask);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
