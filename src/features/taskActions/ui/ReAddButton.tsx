import { TaskModel } from '@/shared/model/task';
import { Button } from '@/shared/ui/button';
import { RotateCw } from 'lucide-react';
import { useTasksStore } from '@/shared/model/tasksStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { useState } from 'react';
import { cloneInstance } from '@/shared/lib/instance-tools';

export function ReAddButton({ task }: { task: TaskModel }) {
  const createTask = useTasksStore((state) => state.createTask);
  const updateTask = useTasksStore((state) => state.updateTask);

  const [popoverOpen, setPopoverOpen] = useState(false);

  const reAddTask = async (date: Date) => {
    const newTask = cloneInstance(task, { completedAt: null, date, selectedAt: null });
    createTask(newTask);

    updateTask(task.id, { completedAt: new Date() });
  };

  const onDateSelect = (date: Date) => {
    reAddTask(date);
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary">
          <RotateCw className="h-4 w-4" />
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
