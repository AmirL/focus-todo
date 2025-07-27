import { TaskModel } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { RotateCw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { useState } from 'react';
import { cloneInstance } from '@/shared/lib/instance-tools';
import { useCreateTaskMutation, useUpdateTaskMutation } from '@/shared/api/tasks';
import { createInstance } from '@/shared/lib/instance-tools';

export function ReAddButton({ task }: { task: TaskModel }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();

  const reAddTask = async (date: Date | null) => {
    const newTask = cloneInstance(task, { 
      completedAt: null, 
      date
    });
    
    const updatedTask = createInstance(TaskModel, { ...task, completedAt: new Date(), updatedAt: new Date() });
    
    // First update the current task to mark it as completed (with optimistic update)
    updateTaskMutation.mutate(updatedTask, {
      onSuccess: () => {
        // Then create the new task after the current one is marked as completed
        createTaskMutation.mutate(newTask);
      }
    });
  };

  const onDateSelect = (date: Date | null) => {
    reAddTask(date);
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" data-testid={`readd-task-${task.id}`}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex flex-col">
          <Button variant="ghost" className="w-full justify-start rounded-none" onClick={() => onDateSelect(null)}>
            Re-add without date
          </Button>
          <div className="border-t">
            <Calendar
              mode="single"
              selected={task.date ? task.date : undefined}
              onSelect={(date) => date && onDateSelect(date)}
              initialFocus
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
