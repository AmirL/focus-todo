import { GoalModel } from '../model/goal';
import { Progress } from '@/shared/ui/progress';

export function Goal({ goal, actionButtons }: { goal: GoalModel; actionButtons?: JSX.Element }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{goal.title}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{goal.progress}%</span>
          {actionButtons}
        </div>
      </div>
      <Progress value={goal.progress} className="h-2" />
    </div>
  );
}
