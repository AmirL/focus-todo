import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useGoalsQuery } from '@/shared/api/goals';
import { TaskMetadata } from './useTaskMetadata';

interface GoalSelectorProps {
  metadata: TaskMetadata;
  onMetadataChange: (updates: Partial<TaskMetadata>) => void;
}

export function GoalSelector({ metadata, onMetadataChange }: GoalSelectorProps) {
  const { data: goals = [], isLoading } = useGoalsQuery();

  return (
    <Select
      value={metadata.selectedGoalId != null ? String(metadata.selectedGoalId) : 'none'}
      onValueChange={(v) => onMetadataChange({ selectedGoalId: v === 'none' ? null : Number(v) })}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[160px] h-8" data-cy="goal-selector">
        <SelectValue placeholder={isLoading ? 'Loading...' : 'Goal (optional)'} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No goal</SelectItem>
        {goals.map((goal) => (
          <SelectItem key={goal.id} value={String(goal.id)}>
            {goal.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
