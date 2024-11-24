import { Task } from '@/classes/task';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useTasksStore } from '@/store/tasksStore';
import dayjs from 'dayjs';
import { useState } from 'react';

export function snoozeTask(task: Task, date: Date) {
  const dateIsAfterToday = dayjs(date).isAfter(dayjs().endOf('day'));
  const selected = dateIsAfterToday ? false : task.starred;
  return { date, selected };
}

export function SnoozeButton({ task }: { task: Task }) {
  const { updateTask } = useTasksStore();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const onDateSelect = (date: Date) => {
    updateTask(task.id, snoozeTask(task, date));
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
