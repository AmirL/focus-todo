import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { TaskMetadata } from './useTaskMetadata';
import { TaskMetadataFields } from './TaskMetadataFields';
import { MarkdownAreaField } from './MarkdownAreaField';

interface TaskFormFieldsProps {
  name: string;
  onNameChange: (name: string) => void;
  details: string;
  onDetailsChange: (details: string) => void;
  metadata: TaskMetadata;
  onMetadataChange: (updates: Partial<TaskMetadata>) => void;
}

export function TaskFormFields({
  name,
  onNameChange,
  details,
  onDetailsChange,
  metadata,
  onMetadataChange,
}: TaskFormFieldsProps) {
  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="mt-1"
          autoFocus
          data-testid="task-name-input"
        />
      </div>

      <TaskMetadataFields metadata={metadata} onMetadataChange={onMetadataChange} />

      <div>
        <Label htmlFor="details">Details</Label>
        <MarkdownAreaField label="" id="details" value={details} onChange={onDetailsChange} />
      </div>
    </div>
  );
}
