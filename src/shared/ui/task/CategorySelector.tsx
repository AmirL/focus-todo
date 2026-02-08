import { SelectTaskCategory } from './SelectTaskCategory';
import { TaskMetadata } from './useTaskMetadata';

interface CategorySelectorProps {
  metadata: TaskMetadata;
  onMetadataChange: (updates: Partial<TaskMetadata>) => void;
}

export function CategorySelector({ metadata, onMetadataChange }: CategorySelectorProps) {
  return (
    <SelectTaskCategory
      selectedListId={metadata.selectedListId}
      setSelectedListId={(listId) => onMetadataChange({ selectedListId: listId })}
    />
  );
}
