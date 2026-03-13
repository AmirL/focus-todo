import { GoalModel } from '@/entities/goal';
import { Button } from '@/shared/ui/button';
import { Trash2 } from 'lucide-react';
import { useUpdateGoalMutation } from '@/shared/api/goals';
import { createInstance } from '@/shared/lib/instance-tools';

export function DeleteGoalButton({ goal }: { goal: GoalModel }) {
  const updateGoalMutation = useUpdateGoalMutation();

  const handleDelete = () => {
    const updatedGoal = createInstance(GoalModel, { ...goal, deletedAt: new Date().toISOString() });
    updateGoalMutation.mutate(updatedGoal);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
      data-cy="delete-goal-button"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
