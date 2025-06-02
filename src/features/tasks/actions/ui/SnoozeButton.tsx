import { TaskModel } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { Clock, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { useState } from 'react';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { createInstance } from '@/shared/lib/instance-tools';

export function SnoozeButton({ task }: { task: TaskModel }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const updateTaskMutation = useUpdateTaskMutation();

  const onDateSelect = async (date: Date | null) => {
    const updatedTask = createInstance(TaskModel, { ...task, date, updatedAt: new Date() });
    updateTaskMutation.mutate(updatedTask);
    setPopoverOpen(false);
  };

  const clearDate = () => {
    onDateSelect(null);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
          <Clock className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        {task.date && (
          <div className="p-2 border-b border-border flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearDate} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" /> Clear Snooze
            </Button>
          </div>
        )}
        <Calendar
          mode="single"
          selected={task.date ? task.date : undefined}
          onSelect={(date) => onDateSelect(date ?? null)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
