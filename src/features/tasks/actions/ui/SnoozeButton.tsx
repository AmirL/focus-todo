import { TaskModel } from '@/shared/model/task';
import { Button } from '@/shared/ui/button';
import { Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { useTasksStore } from '@/shared/model/tasksStore';
import { useState } from 'react';

export function SnoozeButton({ task }: { task: TaskModel }) {
  const updateTask = useTasksStore((state) => state.updateTask);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const onDateSelect = (date: Date) => {
    updateTask(task.id, { date, selectedAt: null });
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
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
