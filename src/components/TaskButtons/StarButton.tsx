import { Task } from '@/classes/task';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { useTasksStore } from '@/store/tasksStore';

export function StarButton({ task }: { task: Task }) {
  const { updateTask } = useTasksStore();

  const toggleTodayTask = (task: Task) => {
    const selected = !task.selected;
    updateTask(task.id, { selected });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggleTodayTask(task)}
      className={task.selected ? 'text-yellow-500 hover:text-yellow-500' : 'text-muted-foreground'}
    >
      <Star fill={task.selected ? '#E3B644' : 'none'} className="h-4 w-4" />
    </Button>
  );
}
