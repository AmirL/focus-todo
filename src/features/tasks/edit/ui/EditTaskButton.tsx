import { TaskModel } from '@/shared/model/task';
import { Pencil } from 'lucide-react';
import { EditTaskDialog } from './EditTaskDialog';
import { Button } from '@/shared/ui/button';

export function EditTaskButton({ task }: { task: TaskModel }) {
  return (
    <EditTaskDialog task={task}>
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <Pencil className="h-4 w-4" />
      </Button>
    </EditTaskDialog>
  );
}
