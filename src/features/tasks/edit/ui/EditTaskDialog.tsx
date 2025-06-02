import { TaskModel } from '@/entities/task/model/task';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Label } from '@/shared/ui/label';
import { MarkdownAreaField } from './MarkdownAreaField';
import { InputField } from './InputField';
import { useUpdateTaskMutation } from '@/shared/api/tasks';
import { createInstance } from '@/shared/lib/instance-tools';

const DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 150, label: '2.5 hours' },
  { value: 240, label: '4 hours' },
  { value: 480, label: '1 day' },
];

export function EditTaskDialog({ task, children }: { task: TaskModel; children: React.ReactNode }) {
  const updateTaskMutation = useUpdateTaskMutation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = new FormData(e.target as HTMLFormElement);

    const name: string = values.get('name') as string;
    const details: string = values.get('details') as string;
    const estimatedDurationStr = values.get('estimatedDuration') as string | null;
    const estimatedDuration = estimatedDurationStr ? parseInt(estimatedDurationStr, 10) : undefined;

    const updatedTask = createInstance(TaskModel, { ...task, name, details, estimatedDuration, updatedAt: new Date() });
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
            <InputField label="Name" id="name" value={task.name} />
            <EstimateDuration task={task} />
            <MarkdownAreaField label="Details" id="details" value={task.details ?? ''} />
            <div className="grid grid-cols-4 items-center gap-4"></div>
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

function EstimateDuration({ task }: { task: TaskModel }) {
  return (
    <div>
      <Label htmlFor="estimatedDuration" className="text-right">
        Est. Duration
      </Label>
      <Select name="estimatedDuration" defaultValue={task.estimatedDuration?.toString()}>
        <SelectTrigger id="estimatedDuration" className="col-span-3">
          <SelectValue placeholder="Select duration" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={' '}>—</SelectItem>
          {DURATION_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
