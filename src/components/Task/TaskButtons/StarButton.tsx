import { isTaskSelected, Task } from '@/data-classes/task';
import { Button } from '@/lib/ui/button';
import { Star } from 'lucide-react';
import { useTasksStore } from '@/store/tasksStore';

export function StarButton({ task }: { task: Task }) {
  const updateTask = useTasksStore((state) => state.updateTask);

  const isSelected = isTaskSelected(task);

  const toggleTodayTask = (task: Task) => {
    const selectedAt = isSelected ? null : new Date();
    updateTask(task.id, { selectedAt });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => toggleTodayTask(task)}
      className={isSelected ? 'text-yellow-500 hover:text-yellow-500' : 'text-muted-foreground'}
    >
      <Star fill={isSelected ? '#E3B644' : 'none'} className="h-4 w-4" />
    </Button>
  );
}
