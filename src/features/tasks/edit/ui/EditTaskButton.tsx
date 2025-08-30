import { TaskModel } from '@/entities/task/model/task';
import { Pencil } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useEditTaskModalStore } from '../model/editTaskModalStore';

export function EditTaskButton({ task }: { task: TaskModel }) {
  const openEdit = useEditTaskModalStore((s) => s.openWithTask);
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-primary"
      data-testid={`edit-task-${task.id}`}
      onClick={() => openEdit(task)}
    >
      <Pencil className="h-4 w-4" />
    </Button>
  );
}
