import { GoalModel } from '@/entities/goal/model/goal';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Slider } from '@/shared/ui/slider';
import { Separator } from '@/shared/ui/separator';
import { createInstance } from '@/shared/lib/instance-tools';
import { useUpdateGoalMutation } from '@/shared/api/goals';
import { useGoalMilestonesQuery } from '@/shared/api/goal-milestones';
import { useState } from 'react';
import { MilestoneTimeline } from './MilestoneTimeline';
import { AddMilestoneForm } from './AddMilestoneForm';

export function EditGoalDialog({ goal, children }: { goal: GoalModel; children: React.ReactNode }) {
  const updateGoalMutation = useUpdateGoalMutation();
  const [progress, setProgress] = useState(goal.progress || 0);
  const { data: milestones = [], isLoading: milestonesLoading } = useGoalMilestonesQuery(goal.id);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const values = new FormData(e.target as HTMLFormElement);
    const title = values.get('title') as string;

    const updatedGoal = createInstance(GoalModel, { ...goal, title, progress });
    updateGoalMutation.mutate(updatedGoal);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
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

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Milestones</h3>
          <MilestoneTimeline milestones={milestones} isLoading={milestonesLoading} />
          <AddMilestoneForm
            goalId={goal.id}
            currentProgress={progress}
            onMilestoneAdded={(newProgress) => setProgress(newProgress)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
