import { EstimatedDurationSelector } from './EstimatedDurationSelector';
import { TaskMetadata } from './useTaskMetadata';

interface DurationSelectorProps {
  metadata: TaskMetadata;
  onMetadataChange: (updates: Partial<TaskMetadata>) => void;
}

export function DurationSelector({ metadata, onMetadataChange }: DurationSelectorProps) {
  return (
    <EstimatedDurationSelector
      value={metadata.selectedDuration ?? null}
      onChange={(duration) => onMetadataChange({ selectedDuration: duration })}
      showLabel={false}
    />
  );
}