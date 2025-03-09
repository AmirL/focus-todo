import { TaskModel } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { Trash2 } from 'lucide-react';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { updateTaskMutation } from '@/shared/api/updateTask.mutation';

export function DeleteButton({ task }: { task: TaskModel }) {
  const updateTask = useTasksStore((state) => state.updateTask);

  const handleDelete = async () => {
    const updatedTask = updateTask(task.id, { deletedAt: new Date() });
    await updateTaskMutation(updatedTask);
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
