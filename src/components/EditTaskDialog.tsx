import { Task } from '@/data-classes/task';
import { useTasksStore } from '@/store/tasksStore';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

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

function MarkdownAreaField(props: { label: string; id: string; value: string }) {
  const { label, id, value: initialValue, ...rest } = props;
  const [activeTab, setActiveTab] = useState('view');
  const [value, setValue] = useState(initialValue);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  return (
    <div>
      <Label htmlFor={id} className="text-right">
        {label}
      </Label>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Textarea id={id} value={value} onChange={onChange} className="min-h-[200px]" {...rest} />
        </TabsContent>
        <TabsContent value="view">
          <ReactMarkdown className="prose prose-sm min-h-[200px]">{value}</ReactMarkdown>
        </TabsContent>
      </Tabs>
      <input type="hidden" name={id} value={value} />
    </div>
  );
}
