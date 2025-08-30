import { useEffect, useState } from 'react';
import { TaskModel } from '@/entities/task/model/task';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { MarkdownAreaField } from './MarkdownAreaField';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { createInstance } from '@/shared/lib/instance-tools';
import { TaskMetadataFields } from '@/shared/ui/task/TaskMetadataFields';
import { useTaskMetadata } from '@/shared/ui/task/useTaskMetadata';

export function EditTaskDialog({ task, open, onOpenChange }: { task: TaskModel; open: boolean; onOpenChange: (open: boolean) => void }) {
  const updateTaskMutation = useUpdateTaskMutation();
  
  // Initialize state with task values
  const [name, setName] = useState(task.name);
  const [details, setDetails] = useState(task.details ?? '');
  const { metadata, updateMetadata, resetMetadata } = useTaskMetadata({
    selectedDuration: task.estimatedDuration ?? null,
    selectedList: task.list,
    isStarred: !!task.selectedAt,
    isBlocker: task.isBlocker,
    selectedDate: task.date ?? null,
  });

  // Reset form values when task changes or dialog opens in controlled mode
  useEffect(() => {
    setName(task.name);
    setDetails(task.details ?? '');
    resetMetadata();
  }, [task.id, open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedTask = createInstance(TaskModel, {
      ...task,
      name,
      details,
      estimatedDuration: metadata.selectedDuration,
      list: metadata.selectedList,
      selectedAt: metadata.isStarred ? (task.selectedAt || new Date()) : null,
      isBlocker: metadata.isBlocker,
      date: metadata.selectedDate,
      updatedAt: new Date()
    });
    updateTaskMutation.mutate(updatedTask);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <TaskMetadataFields
              metadata={metadata}
              onMetadataChange={updateMetadata}
            />
            
            <div>
              <Label htmlFor="details">Details</Label>
              <MarkdownAreaField 
                label="" 
                id="details" 
                value={details}
                onChange={setDetails}
                data-testid="task-details-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" data-testid="save-task-changes-button">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
