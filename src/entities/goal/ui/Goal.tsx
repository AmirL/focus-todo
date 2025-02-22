import { GoalModel } from '../model/goal';
import { Progress } from '@/shared/ui/progress';

export function Goal({ goal }: { goal: GoalModel }) {
  return (
    <>
      <div className="flex items-center">
        <Progress value={goal.progress} className="mr-4 w-10" />
        <span className="flex-grow truncate">{goal.title}</span>
      </div>
    </>
  );
}
