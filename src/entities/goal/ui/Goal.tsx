import { GoalModel } from '../model/goal';
import { Progress } from '@/shared/ui/progress';

export function Goal({ goal }: { goal: GoalModel }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{goal.title}</span>
        <span className="text-muted-foreground">{goal.progress}%</span>
      </div>
      <Progress value={goal.progress} className="h-2" />
      {/* <span className="flex-grow truncate">{goal.title}</span> */}
    </div>
  );
}
