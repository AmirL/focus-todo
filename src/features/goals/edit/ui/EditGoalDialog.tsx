import { GoalModel } from '@/entities/goal/model/goal';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Slider } from '@/shared/ui/slider';
import { Textarea } from '@/shared/ui/textarea';
import { createInstance } from '@/shared/lib/instance-tools';
import { useUpdateGoalMutation } from '@/shared/api/goals';
import { useState } from 'react';

export function EditGoalDialog({ goal, children }: { goal: GoalModel; children: React.ReactNode }) {
  const updateGoalMutation = useUpdateGoalMutation();
  const [progress, setProgress] = useState(goal.progress || 0);
  const [description, setDescription] = useState(goal.description ?? '');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values = new FormData(e.target as HTMLFormElement);
    const title = values.get('title') as string;

    const updatedGoal = createInstance(GoalModel, { ...goal, title, progress, description });
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
              <Input id="title" name="title" defaultValue={goal.title} data-cy="edit-goal-title-input" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this goal..."
                className="min-h-[80px]"
                data-cy="edit-goal-description-input"
              />
            </div>
            <div>
              <Label htmlFor="progress">Progress: {progress}%</Label>
              <Slider
                id="progress"
                min={0}
                max={100}
                step={5}
                value={[progress]}
                onValueChange={(value) => setProgress(value[0])}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogTrigger asChild>
              <Button type="submit" data-cy="save-goal-button">Save changes</Button>
            </DialogTrigger>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
