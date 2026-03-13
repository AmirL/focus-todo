import { GoalModel, GoalFormFields } from '@/entities/goal';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
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
  const [description, setDescription] = useState(goal.description ?? '');
  const { data: milestones = [], isLoading: milestonesLoading } = useGoalMilestonesQuery(goal.id);

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
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={onSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit goal</DialogTitle>
          </DialogHeader>
          <GoalFormFields
            defaultTitle={goal.title}
            description={description}
            onDescriptionChange={setDescription}
            progress={progress}
            onProgressChange={setProgress}
            dataCyPrefix="edit-"
          />
          <DialogFooter>
            <DialogTrigger asChild>
              <Button type="submit" data-cy="save-goal-button">Save changes</Button>
            </DialogTrigger>
          </DialogFooter>
        </form>

        <Separator />

        <div className="space-y-4" data-cy="milestones-section">
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
