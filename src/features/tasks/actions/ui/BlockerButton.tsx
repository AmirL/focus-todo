import { TaskModel } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { Users } from 'lucide-react';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { createInstance } from '@/shared/lib/instance-tools';

export function BlockerButton({ task }: { task: TaskModel }) {
  const updateTaskMutation = useUpdateTaskMutation();

  const handleToggleBlocker = () => {
    const updatedTask = createInstance(TaskModel, { ...task, isBlocker: !task.isBlocker, updatedAt: new Date() });
    updateTaskMutation.mutate(updatedTask);
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
