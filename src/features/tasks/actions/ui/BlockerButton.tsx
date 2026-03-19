import { TaskModel } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { Users } from 'lucide-react';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { buildToggledBlockerTask } from '../lib/taskActionUtils';

export function BlockerButton({ task }: { task: TaskModel }) {
  const updateTaskMutation = useUpdateTaskMutation();

  const handleToggleBlocker = () => {
    updateTaskMutation.mutate(buildToggledBlockerTask(task));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleBlocker}
      className={`h-8 w-8 ${
        task.isBlocker ? 'text-blue-600 hover:text-blue-700' : 'text-muted-foreground hover:text-blue-600'
      }`}
      data-cy={`blocker-task-${task.id}`}
    >
      <Users fill={task.isBlocker ? '#2563eb' : 'none'} className="h-4 w-4" />
    </Button>
  );
}
