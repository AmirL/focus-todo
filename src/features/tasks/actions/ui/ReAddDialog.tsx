import { useEffect, useRef, useState } from 'react';
import { TaskModel } from '@/entities/task/model/task';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { TaskFormFields } from '@/shared/ui/task/TaskFormFields';
import { useTaskMetadata } from '@/shared/ui/task/useTaskMetadata';
import { Button } from '@/shared/ui/button';
import { useCreateTaskMutation, useUpdateTaskMutation } from '@/shared/api/tasks';
import {
  buildCompletedOriginalTask,
  buildReAddedTask,
  buildReAddMetadataDefaults,
  getReAddFormDefaults,
  canSubmitReAdd,
} from '../lib/reAddUtils';

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
  const formDefaults = getReAddFormDefaults(task);
  const [name, setName] = useState(formDefaults.name);
  const [details, setDetails] = useState(formDefaults.details);
  const createTaskMutation = useCreateTaskMutation();
  const updateTaskMutation = useUpdateTaskMutation();

  const { metadata, updateMetadata, resetMetadata } = useTaskMetadata(
    buildReAddMetadataDefaults(task, initialDate),
  );

  useEffect(() => {
    if (open) {
      setName(task.name);
      setDetails(task.details ?? '');
      resetMetadata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task.id]);

  const hasMarkedCompletedRef = useRef(false);
  useEffect(() => {
    if (open && !hasMarkedCompletedRef.current) {
      updateTaskMutation.mutate(buildCompletedOriginalTask(task));
      hasMarkedCompletedRef.current = true;
    } else if (!open) {
      hasMarkedCompletedRef.current = false;
    }
  }, [open, task, updateTaskMutation]);

  const handleReAdd = () => {
    createTaskMutation.mutate(buildReAddedTask(name, details, metadata));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Re-add Task</DialogTitle>
          <DialogDescription>Adjust the task before re-adding.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <TaskFormFields
            name={name}
            onNameChange={setName}
            details={details}
            onDetailsChange={setDetails}
            metadata={metadata}
            onMetadataChange={updateMetadata}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReAdd} disabled={!canSubmitReAdd(name)}>
            Re-add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
