import { MilestoneModel } from '@/entities/goal';
import dayjs from 'dayjs';

export function MilestoneTimeline({
  milestones,
  isLoading,
}: {
  milestones: MilestoneModel[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="text-muted-foreground text-xs">Loading milestones...</div>;
  }

  if (milestones.length === 0) {
    return <div className="text-muted-foreground text-xs">No milestones yet</div>;
  }

  return (
    <div className="max-h-[200px] overflow-y-auto space-y-3" data-cy="milestone-timeline">
      {milestones.map((milestone) => (
        <div key={milestone.id} className="flex items-start gap-3" data-cy="milestone-entry">
          <span className="text-xs font-semibold bg-primary/10 text-primary rounded px-1.5 py-0.5 whitespace-nowrap">
            {milestone.progress}%
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm break-words">{milestone.description}</p>
            <p className="text-xs text-muted-foreground">{formatDate(milestone.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateValue: string): string {
  const date = dayjs(dateValue);
  const today = dayjs();
  const yesterday = today.subtract(1, 'day');

  if (date.isSame(today, 'day')) {
    return 'Today';
  }
  if (date.isSame(yesterday, 'day')) {
    return 'Yesterday';
  }
  return date.format('MMM D, YYYY');
}
