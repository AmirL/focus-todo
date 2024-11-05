import { Task } from '@/classes/task';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { parseISO } from 'date-fns';
import { useTasksStore } from '@/store/tasksStore';

export function SnoozeButton({ task }: { task: Task }) {
  const { updateTask } = useTasksStore();

  const snoozeTodo = (date: Date) => {
    updateTask(task.id, { date: date.toISOString() });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Clock className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={task.date ? parseISO(task.date) : undefined}
          onSelect={(date) => date && snoozeTodo(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
