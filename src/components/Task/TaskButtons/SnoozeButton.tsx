import { Task } from '@/data-classes/task';
import { Button } from '@/lib/ui/button';
import { Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/lib/ui/popover';
import { Calendar } from '@/lib/ui/calendar';
import { useTasksStore } from '@/store/tasksStore';
import { useState } from 'react';

export function SnoozeButton({ task }: { task: Task }) {
  const updateTask = useTasksStore((state) => state.updateTask);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const onDateSelect = (date: Date) => {
    updateTask(task.id, { date, selectedAt: null });
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Clock className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="single"
          selected={task.date ? task.date : undefined}
          onSelect={(date) => date && onDateSelect(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
