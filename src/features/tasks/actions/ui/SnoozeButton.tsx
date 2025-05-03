import { TaskModel } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { Clock, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { useState } from 'react';
import { updateTaskMutation } from '@/shared/api/updateTask.mutation';
import dayjs from 'dayjs';

export function SnoozeButton({ task }: { task: TaskModel }) {
  const updateTask = useTasksStore((state) => state.updateTask);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const onDateSelect = async (date: Date | null) => {
    const updatedTask = updateTask(task.id, { date });
    setPopoverOpen(false);
    await updateTaskMutation(updatedTask);
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
