import { Users } from 'lucide-react';
import { IconButtonToggle } from '@/shared/ui/IconButtonToggle';
import { TaskMetadata } from './useTaskMetadata';

interface BlockerToggleProps {
  metadata: TaskMetadata;
  onMetadataChange: (updates: Partial<TaskMetadata>) => void;
}

export function BlockerToggle({ metadata, onMetadataChange }: BlockerToggleProps) {
  return (
    <IconButtonToggle
      icon={(isChecked) => <Users fill={isChecked ? '#2563eb' : 'none'} className="h-4 w-4" />}
      tooltipContent="Blocker"
      isChecked={metadata.isBlocker}
      onCheckedChange={(blocker) => onMetadataChange({ isBlocker: blocker })}
      className={
        metadata.isBlocker ? 'text-blue-600 hover:text-blue-700 p-2 sm:p-1' : 'text-muted-foreground hover:text-blue-600 p-2 sm:p-1'
      }
    />
  );
}