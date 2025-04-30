import { TaskModel } from '@/entities/task/model/task';
import { Users } from 'lucide-react';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { updateTaskMutation } from '@/shared/api/updateTask.mutation';

export function BlockerButton({ task }: { task: TaskModel }) {
  const toggleIsBlocker = async (isBlocker: boolean) => {
    const updateTask = useTasksStore.getState().updateTask;

    const updatedTask = updateTask(task.id, { isBlocker });
    await updateTaskMutation(updatedTask);
  };

  return (
    <button
      onClick={() => toggleIsBlocker(!task.isBlocker)}
      className={
        'flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors' +
        (task.isBlocker ? ' hover:text-blue-700 text-blue-600' : 'text-muted-foreground hover:text-blue-600')
      }
    >
      <Users fill={task.isBlocker ? '#2563eb' : 'none'} className="h-4 w-4" />
    </button>
  );
}
