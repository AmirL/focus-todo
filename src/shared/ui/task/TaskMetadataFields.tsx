import { TaskMetadata } from './useTaskMetadata';
import { CategorySelector } from './CategorySelector';
import { GoalSelector } from './GoalSelector';
import { DurationSelector } from './DurationSelector';
import { BlockerToggle } from './BlockerToggle';
import { StarredToggle } from './StarredToggle';
import { TaskDatePicker } from './TaskDatePicker';

interface TaskMetadataFieldsProps {
  metadata: TaskMetadata;
  onMetadataChange: (updates: Partial<TaskMetadata>) => void;
}

export function TaskMetadataFields({ metadata, onMetadataChange }: TaskMetadataFieldsProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground font-medium">Category</div>
      <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:gap-3">
        {/* Mobile: Category only, Desktop: Category + Goal + Duration */}
        <div className="flex items-center gap-2">
          <div className="flex-1 sm:flex-none">
            <CategorySelector metadata={metadata} onMetadataChange={onMetadataChange} />
          </div>
          <div className="flex-1 sm:flex-none">
            <GoalSelector metadata={metadata} onMetadataChange={onMetadataChange} />
          </div>
          <div className="hidden sm:block">
            <DurationSelector metadata={metadata} onMetadataChange={onMetadataChange} />
          </div>
        </div>
        {/* Mobile: Duration + Action buttons, Desktop: Action buttons only */}
        <div className="flex items-center gap-1 sm:ml-auto">
          <div className="block sm:hidden">
            <DurationSelector metadata={metadata} onMetadataChange={onMetadataChange} />
          </div>
          <BlockerToggle metadata={metadata} onMetadataChange={onMetadataChange} />
          <StarredToggle metadata={metadata} onMetadataChange={onMetadataChange} />
          <TaskDatePicker metadata={metadata} onMetadataChange={onMetadataChange} />
        </div>
      </div>
    </div>
  );
}
