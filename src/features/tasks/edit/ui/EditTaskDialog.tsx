import { useState } from 'react';
import { TaskModel } from '@/entities/task/model/task';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { MarkdownAreaField } from './MarkdownAreaField';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { createInstance } from '@/shared/lib/instance-tools';
import { TaskMetadataFields } from '@/shared/ui/task/TaskMetadataFields';

export function EditTaskDialog({ task, children }: { task: TaskModel; children: React.ReactNode }) {
  const updateTaskMutation = useUpdateTaskMutation();
  
  // Initialize state with task values
  const [name, setName] = useState(task.name);
  const [details, setDetails] = useState(task.details ?? '');
  const [selectedDuration, setSelectedDuration] = useState<number | null>(task.estimatedDuration ?? null);
  const [selectedList, setSelectedList] = useState(task.list);
  const [isStarred, setIsStarred] = useState(!!task.selectedAt);
  const [isBlocker, setIsBlocker] = useState(task.isBlocker);
  const [selectedDate, setSelectedDate] = useState<Date | null>(task.date ?? null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedTask = createInstance(TaskModel, {
      ...task,
      name,
      details,
      estimatedDuration: selectedDuration,
      list: selectedList,
      selectedAt: isStarred ? (task.selectedAt || new Date()) : null,
      isBlocker,
      date: selectedDate,
      updatedAt: new Date()
    });
    updateTaskMutation.mutate(updatedTask);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
              selectedDuration={selectedDuration}
              onDurationChange={setSelectedDuration}
              selectedList={selectedList}
              onListChange={setSelectedList}
              isStarred={isStarred}
              onStarredChange={setIsStarred}
              isBlocker={isBlocker}
              onBlockerChange={setIsBlocker}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
            
            <div>
              <Label htmlFor="details">Details</Label>
              <MarkdownAreaField 
                label="" 
                id="details" 
                value={details}
                onChange={setDetails}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogTrigger asChild>
              <Button type="submit">Save changes</Button>
            </DialogTrigger>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

