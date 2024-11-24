import { Task } from '@/classes/task';
import { useTasksStore } from '@/store/tasksStore';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function EditTaskDialog({ task, children }: { task: Task; children: React.ReactNode }) {
  const { updateTask } = useTasksStore();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values = new FormData(e.target as HTMLFormElement);
    const name: string = values.get('name') as string;
    const details: string = values.get('details') as string;
    updateTask(task.id, { name, details });
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
            <MarkdownAreaField label="Details" id="details" value={task.details} />
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

function InputField({ label, id, value, ...props }: { label: string; id: string; value: string }) {
  const setCursorToEnd = (event: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      const input = event.target;
      input.setSelectionRange(input.value.length, input.value.length);
    }, 0);
  };

  return (
    <div>
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Input id={id} name={id} defaultValue={value} type="text" {...props} onFocus={setCursorToEnd} />
    </div>
  );
}

function MarkdownAreaField({ label, id, value, ...props }: { label: string; id: string; value: string }) {
  return (
    <div>
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Textarea id={id} name={id} defaultValue={value} className="min-h-[200px]" {...props} />
    </div>
  );
}
