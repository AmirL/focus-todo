import { TaskModel } from '@/shared/model/task';
import { Button } from '@/shared/ui/button';
import { Trash2 } from 'lucide-react';
import { useTasksStore } from '@/shared/model/tasksStore';

export function DeleteButton({ task }: { task: TaskModel }) {
  const updateTask = useTasksStore((state) => state.updateTask);

  const handleDelete = () => {
    updateTask(task.id, { deletedAt: new Date() });
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive">
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
