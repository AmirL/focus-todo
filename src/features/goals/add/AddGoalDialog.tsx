import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { useCreateGoalMutation } from '@/shared/api/goals';
import { GoalModel, GoalFormFields } from '@/entities/goal';
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
          <GoalFormFields
            description={description}
            onDescriptionChange={setDescription}
            progress={progress}
            onProgressChange={setProgress}
          />
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
