import { isTaskSelected, TaskModel } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { Users } from 'lucide-react';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { cn } from '@/shared/lib/utils';
import { updateTaskMutation } from '@/shared/api/updateTask.mutation';

export function DependencyButton({ task }: { task: TaskModel }) {
  const toggleIsDependency = async (isDependency: boolean) => {
    const updateTask = useTasksStore.getState().updateTask;

    const updatedTask = updateTask(task.id, { isDependency });

    await updateTaskMutation(updatedTask);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggleIsDependency(!task.isDependency)}
      className={cn(
        'h-8 w-8',
        task.isDependency ? ' hover:text-blue-700 text-blue-600' : 'text-muted-foreground hover:text-blue-600'
      )}
    >
      <Users fill={task.isDependency ? '#2563eb' : 'none'} className="h-4 w-4" />
    </Button>
  );
}
