import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { useCreateGoalMutation } from '@/shared/api/goals';
import { GoalModel } from '@/entities/goal/model/goal';
import { createInstance } from '@/shared/lib/instance-tools';

export function AddGoalDialog() {
  const [open, setOpen] = useState(false);
  const createGoalMutation = useCreateGoalMutation();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values = new FormData(e.target as HTMLFormElement);
    const title = values.get('title') as string;
    const progressStr = values.get('progress') as string;
    const progress = parseInt(progressStr || '0', 10);
    const newGoal = createInstance(GoalModel, { title, progress, list: 'General' });
    createGoalMutation.mutate(newGoal);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Add Goal</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New Goal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="progress">Progress</Label>
              <Input id="progress" name="progress" type="number" min="0" max="100" defaultValue="0" />
            </div>
          </div>
          <DialogFooter>
            <DialogTrigger asChild>
              <Button type="submit">Create</Button>
            </DialogTrigger>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
