import { TaskModel } from '@/entities/task/model/task';
import { useTasksStore } from '@/entities/task/model/tasksStore';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { MarkdownAreaField } from './MarkdownAreaField';
import { InputField } from './InputField';
import { updateTaskMutation } from '@/shared/api/updateTask.mutation';

export function EditTaskDialog({ task, children }: { task: TaskModel; children: React.ReactNode }) {
  const updateTask = useTasksStore((state) => state.updateTask);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = new FormData(e.target as HTMLFormElement);

    const name: string = values.get('name') as string;
    const details: string = values.get('details') as string;

    const updatedTask = updateTask(task.id, { name, details });
    await updateTaskMutation(updatedTask);
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
