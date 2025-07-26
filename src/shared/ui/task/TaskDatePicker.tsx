import { DatePickerButton } from './DatePickerButton';
import { TaskMetadata } from './useTaskMetadata';

interface TaskDatePickerProps {
  metadata: TaskMetadata;
  onMetadataChange: (updates: Partial<TaskMetadata>) => void;
}

export function TaskDatePicker({ metadata, onMetadataChange }: TaskDatePickerProps) {
  return (
    <DatePickerButton 
      selectedDate={metadata.selectedDate} 
      onDateChange={(date) => onMetadataChange({ selectedDate: date })} 
    />
  );
}