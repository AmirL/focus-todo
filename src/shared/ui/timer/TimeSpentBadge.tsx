import { Clock } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { formatDuration } from '@/shared/lib/format-duration';
import { cn } from '@/shared/lib/utils';

interface TimeSpentBadgeProps {
  actualMinutes: number;
  estimatedMinutes?: number | null;
  className?: string;
}

export function TimeSpentBadge({ actualMinutes, estimatedMinutes, className }: TimeSpentBadgeProps) {
  if (actualMinutes <= 0) return null;

  const actualFormatted = formatDuration(actualMinutes);
  const estimatedFormatted = estimatedMinutes ? formatDuration(estimatedMinutes) : null;

  const isOver = estimatedMinutes ? actualMinutes > estimatedMinutes : false;

  return (
    <Badge
      variant="outline"
      data-cy="time-spent-badge"
      className={cn(
        'text-xs font-normal gap-1',
        isOver ? 'text-red-600 border-red-300 bg-red-50' : 'text-blue-600 border-blue-300 bg-blue-50',
        className
      )}
    >
      <Clock className="h-3 w-3" />
      <span>
        {actualFormatted}
        {estimatedFormatted && (
          <span className="text-muted-foreground"> / ~{estimatedFormatted}</span>
        )}
      </span>
    </Badge>
  );
}
