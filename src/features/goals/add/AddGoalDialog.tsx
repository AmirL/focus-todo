import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Slider } from '@/shared/ui/slider';
import { Textarea } from '@/shared/ui/textarea';
import { useCreateGoalMutation } from '@/shared/api/goals';
import { GoalModel } from '@/entities/goal';
import { createInstance } from '@/shared/lib/instance-tools';
import { useListsQuery } from '@/shared/api/lists';

export function AddGoalDialog() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [description, setDescription] = useState('');
  const createGoalMutation = useCreateGoalMutation();
  const { data: lists = [] } = useListsQuery();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values = new FormData(e.target as HTMLFormElement);
    const title = values.get('title') as string;
    const firstListId = lists.length > 0 ? Number(lists[0].id) : 1;
    const newGoal = createInstance(GoalModel, { title, description, progress, listId: firstListId });
    createGoalMutation.mutate(newGoal);
    setOpen(false);
    setProgress(0);
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" data-cy="add-goal-button">Add Goal</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>New Goal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required data-cy="goal-title-input" />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this goal..."
                className="min-h-[80px]"
                data-cy="goal-description-input"
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
              <Button type="submit" data-cy="create-goal-button">Create</Button>
            </DialogTrigger>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
