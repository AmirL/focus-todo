import { TaskModel } from '@/shared/model/task';
import { Pencil } from 'lucide-react';
import { EditTaskDialog } from './EditTaskDialog';
import { Button } from '@/shared/ui/button';

export function EditTaskButton({ task }: { task: TaskModel }) {
  return (
    <EditTaskDialog task={task}>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
        <Pencil className="h-4 w-4" />
      </Button>
    </EditTaskDialog>
  );
}
