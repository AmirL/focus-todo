import { Task } from '@/classes/task';
import { Button } from '../ui/button';
import { Pencil } from 'lucide-react';
import { EditTaskDialog } from '../EditTaskDialog';

export function EditTaskButton({ task }: { task: Task }) {
  return (
    <EditTaskDialog task={task}>
      <Button variant="ghost" size="icon" className="text-muted-foreground">
        <Pencil className="h-4 w-4" />
      </Button>
    </EditTaskDialog>
  );
}
