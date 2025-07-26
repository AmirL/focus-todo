import { Star } from 'lucide-react';
import { IconButtonToggle } from '@/shared/ui/IconButtonToggle';
import { TaskMetadata } from './useTaskMetadata';

interface StarredToggleProps {
  metadata: TaskMetadata;
  onMetadataChange: (updates: Partial<TaskMetadata>) => void;
}

export function StarredToggle({ metadata, onMetadataChange }: StarredToggleProps) {
  return (
    <IconButtonToggle
      icon={(isChecked) => <Star fill={isChecked ? '#E3B644' : 'none'} className="h-4 w-4" />}
      tooltipContent="Selected"
      isChecked={metadata.isStarred}
      onCheckedChange={(starred) => onMetadataChange({ isStarred: starred })}
      className={
        metadata.isStarred
          ? 'text-yellow-500 hover:text-yellow-600 p-2 sm:p-1'
          : 'text-muted-foreground hover:text-yellow-500 p-2 sm:p-1'
      }
    />
  );
}