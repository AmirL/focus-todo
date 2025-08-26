import { useState } from 'react';
import { RotateCw } from 'lucide-react';
import { TaskModel } from '@/entities/task/model/task';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { TaskMetadataFields } from '@/shared/ui/task/TaskMetadataFields';
import { useTaskMetadata } from '@/shared/ui/task/useTaskMetadata';
import { useCreateTaskMutation, useUpdateTaskMutation } from '@/shared/api/tasks';
import { createInstance } from '@/shared/lib/instance-tools';

export function ReAddButton({ task }: { task: TaskModel }) {
  const [open, setOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [name, setName] = useState(task.name);

  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();

  const { metadata, updateMetadata } = useTaskMetadata({
    selectedDuration: task.estimatedDuration ?? null,
    selectedList: task.list,
    isStarred: !!task.selectedAt,
    isBlocker: !!task.isBlocker,
    selectedDate: task.date ?? null,
  });

  const handleOpen = (value: boolean) => {
    setOpen(value);
    if (value) {
      setName(task.name);
    }
  };

  const chooseDateAndOpen = (date: Date | null) => {
    updateMetadata({ selectedDate: date });
    setPopoverOpen(false);
    setOpen(true);
  };

  const handleReAdd = async () => {
    const newTask = createInstance(TaskModel, {
      ...task,
      name,
      completedAt: null,
      date: metadata.selectedDate,
      list: metadata.selectedList,
      selectedAt: metadata.isStarred ? new Date() : null,
      isBlocker: metadata.isBlocker,
      estimatedDuration: metadata.selectedDuration ?? null,
    });

    const updatedTask = createInstance(TaskModel, {
      ...task,
      completedAt: new Date(),
      updatedAt: new Date(),
    });

    updateTaskMutation.mutate(updatedTask, {
      onSuccess: () => {
        createTaskMutation.mutate(newTask);
      },
    });

    setOpen(false);
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            data-testid={`readd-task-${task.id}`}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex flex-col">
            <Button
              variant="ghost"
              className="w-full justify-start rounded-none"
              onClick={() => chooseDateAndOpen(null)}
            >
              Re-add without date
            </Button>
            <div className="border-t">
              <Calendar
                mode="single"
                selected={metadata.selectedDate ?? undefined}
                onSelect={(date) => date && chooseDateAndOpen(date)}
                initialFocus
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Re-add Task</DialogTitle>
            <DialogDescription>Adjust the title or metadata before re-adding.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <Textarea
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-[80px] resize-none"
              autoFocus
            />

            <TaskMetadataFields metadata={metadata} onMetadataChange={updateMetadata} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReAdd} disabled={!name.trim()}>
              Re-add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
