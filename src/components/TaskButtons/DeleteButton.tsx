import { Task } from '@/classes/task';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useTasksStore } from '@/store/tasksStore';

export function DeleteButton({ task }: { task: Task }) {
  const { deleteTask } = useTasksStore();

  const handleDelete = () => {
    deleteTask(task.id);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive">
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
