import { TaskModel } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { RotateCw } from 'lucide-react';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { useState } from 'react';
import { cloneInstance } from '@/shared/lib/instance-tools';
import { createTaskMutation } from '@/shared/api/createTask.mutation';
import { updateTaskMutation } from '@/shared/api/updateTask.mutation';

export function ReAddButton({ task }: { task: TaskModel }) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const reAddTask = async (date: Date) => {
    const store = useTasksStore.getState();

    const newTask = cloneInstance(task, { completedAt: null, date, selectedAt: null });
    const created = await createTaskMutation(newTask);
    store.addTask(created);

    const updatedTask = store.updateTask(task.id, { completedAt: new Date() });
    await updateTaskMutation(updatedTask);
  };

  const onDateSelect = (date: Date) => {
    reAddTask(date);
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
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
