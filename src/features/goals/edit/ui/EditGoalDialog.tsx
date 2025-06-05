import { GoalModel } from '@/entities/goal/model/goal';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { createInstance } from '@/shared/lib/instance-tools';
import { useUpdateGoalMutation } from '@/shared/api/goals';

export function EditGoalDialog({ goal, children }: { goal: GoalModel; children: React.ReactNode }) {
  const updateGoalMutation = useUpdateGoalMutation();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values = new FormData(e.target as HTMLFormElement);
    const title = values.get('title') as string;
    const progressStr = values.get('progress') as string;
    const progress = parseInt(progressStr, 10);

    const updatedGoal = createInstance(GoalModel, { ...goal, title, progress });
    updateGoalMutation.mutate(updatedGoal);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit goal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={goal.title} />
            </div>
            <div>
              <Label htmlFor="progress">Progress</Label>
              <Input id="progress" name="progress" type="number" min="0" max="100" defaultValue={goal.progress} />
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
