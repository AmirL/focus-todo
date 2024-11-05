import { Task } from '@/classes/task';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import { useTasksStore } from '@/store/tasksStore';

export function ReAddButton({ task }: { task: Task }) {
  const { createTask, updateTask } = useTasksStore();

  const reAddTask = async () => {
    const newTask: Task = Object.assign(new Task(), {
      ...task,
      id: undefined,
      completedAt: null,
      date: null,
      selected: false,
    });
    createTask(newTask);

    updateTask(task.id, { completedAt: new Date().toISOString() });
  };
  return (
    <Button variant="ghost" size="icon" onClick={reAddTask} className="text-primary">
      <RotateCw className="h-4 w-4" />
    </Button>
  );
}
