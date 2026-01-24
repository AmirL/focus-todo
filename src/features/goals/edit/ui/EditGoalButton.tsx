import { GoalModel } from '@/entities/goal/model/goal';
import { Pencil } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { EditGoalDialog } from './EditGoalDialog';

export function EditGoalButton({ goal }: { goal: GoalModel }) {
  return (
    <EditGoalDialog goal={goal}>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" data-cy="edit-goal-button">
        <Pencil className="h-4 w-4" />
      </Button>
    </EditGoalDialog>
  );
}
