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
      <div className="flex flex-col space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <CategorySelector metadata={metadata} onMetadataChange={onMetadataChange} />
          <GoalSelector metadata={metadata} onMetadataChange={onMetadataChange} />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <DurationSelector metadata={metadata} onMetadataChange={onMetadataChange} />
          <BlockerToggle metadata={metadata} onMetadataChange={onMetadataChange} />
          <StarredToggle metadata={metadata} onMetadataChange={onMetadataChange} />
          <TaskDatePicker metadata={metadata} onMetadataChange={onMetadataChange} />
        </div>
      </div>
    </div>
  );
}
