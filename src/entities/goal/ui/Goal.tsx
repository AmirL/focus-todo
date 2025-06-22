import { GoalModel } from '../model/goal';
import { Progress } from '@/shared/ui/progress';
import { CollapsibleActions } from '@/shared/ui/collapsible-actions';

export function Goal({ goal, actionButtons }: { goal: GoalModel; actionButtons?: JSX.Element }) {
  return (
    <div className="group space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{goal.title}</span>
        {actionButtons && (
          <CollapsibleActions>
            {actionButtons}
          </CollapsibleActions>
        )}
      </div>
      <Progress value={goal.progress} className="h-2" />
    </div>
  );
}
