import { useEffect, useRef, useState } from 'react';
import { TaskModel } from '@/entities/task/model/task';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Textarea } from '@/shared/ui/textarea';
import { TaskMetadataFields } from '@/shared/ui/task/TaskMetadataFields';
import { useTaskMetadata } from '@/shared/ui/task/useTaskMetadata';
import { Button } from '@/shared/ui/button';
import { createInstance } from '@/shared/lib/instance-tools';
import { useCreateTaskMutation, useUpdateTaskMutation } from '@/shared/api/tasks';

export function ReAddDialog({
  task,
  open,
  onOpenChange,
  initialDate,
}: {
  task: TaskModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate: Date | null;
}) {
  const [name, setName] = useState(task.name);
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();

  const { metadata, updateMetadata, resetMetadata } = useTaskMetadata({
    selectedDuration: task.estimatedDuration ?? null,
    selectedList: task.list,
    isStarred: !!task.selectedAt,
    isBlocker: !!task.isBlocker,
    selectedDate: initialDate ?? task.date ?? null,
  });

  useEffect(() => {
    if (open) {
      setName(task.name);
      resetMetadata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task.id]);

  const hasMarkedCompletedRef = useRef(false);
  useEffect(() => {
    if (open && !hasMarkedCompletedRef.current) {
      const updatedTask = createInstance(TaskModel, {
        ...task,
        completedAt: new Date(),
        updatedAt: new Date(),
      });
      updateTaskMutation.mutate(updatedTask);
      hasMarkedCompletedRef.current = true;
    } else if (!open) {
      hasMarkedCompletedRef.current = false;
    }
  }, [open, task, updateTaskMutation]);

  const handleReAdd = () => {
    const newTask = createInstance(TaskModel, {
      name,
      details: task.details ?? '',
      list: metadata.selectedList,
      selectedAt: metadata.isStarred ? new Date() : null,
      isBlocker: metadata.isBlocker,
      date: metadata.selectedDate,
      estimatedDuration: metadata.selectedDuration ?? null,
    });
    createTaskMutation.mutate(newTask);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReAdd} disabled={!name.trim()}>
            Re-add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
