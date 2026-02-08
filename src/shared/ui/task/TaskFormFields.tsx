import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { TaskMetadata } from './useTaskMetadata';
import { TaskMetadataFields } from './TaskMetadataFields';
import { MarkdownAreaField } from './MarkdownAreaField';
import { AiSuggestionBanner } from './AiSuggestionBanner';
import { getPendingSuggestion } from '@/shared/lib/aiSuggestions';
import { formatDuration } from '@/shared/lib/format-duration';
import type { AiSuggestions } from '@/shared/types/aiSuggestions';

interface TaskFormFieldsProps {
  name: string;
  onNameChange: (name: string) => void;
  details: string;
  onDetailsChange: (details: string) => void;
  metadata: TaskMetadata;
  onMetadataChange: (updates: Partial<TaskMetadata>) => void;
  aiSuggestions?: AiSuggestions | null;
  onAcceptSuggestion?: (fieldName: string) => void;
  onRejectSuggestion?: (fieldName: string) => void;
}

export function TaskFormFields({
  name,
  onNameChange,
  details,
  onDetailsChange,
  metadata,
  onMetadataChange,
  aiSuggestions,
  onAcceptSuggestion,
  onRejectSuggestion,
}: TaskFormFieldsProps) {
  const nameSuggestion = getPendingSuggestion(aiSuggestions ?? null, 'name');
  const detailsSuggestion = getPendingSuggestion(aiSuggestions ?? null, 'details');
  const durationSuggestion = getPendingSuggestion(aiSuggestions ?? null, 'estimatedDuration');

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
        {nameSuggestion && onAcceptSuggestion && onRejectSuggestion && (
          <AiSuggestionBanner
            fieldName="name"
            suggestion={nameSuggestion}
            onAccept={() => onAcceptSuggestion('name')}
            onReject={() => onRejectSuggestion('name')}
          />
        )}
      </div>

      <TaskMetadataFields metadata={metadata} onMetadataChange={onMetadataChange} />

      {durationSuggestion && onAcceptSuggestion && onRejectSuggestion && (
        <AiSuggestionBanner
          fieldName="estimatedDuration"
          suggestion={durationSuggestion}
          displayValue={formatDuration(parseInt(durationSuggestion, 10)) ?? durationSuggestion}
          onAccept={() => onAcceptSuggestion('estimatedDuration')}
          onReject={() => onRejectSuggestion('estimatedDuration')}
        />
      )}

      <div>
        <Label htmlFor="details">Details</Label>
        <MarkdownAreaField label="" id="details" value={details} onChange={onDetailsChange} />
        {detailsSuggestion && onAcceptSuggestion && onRejectSuggestion && (
          <AiSuggestionBanner
            fieldName="details"
            suggestion={detailsSuggestion}
            renderAsMarkdown
            onAccept={() => onAcceptSuggestion('details')}
            onReject={() => onRejectSuggestion('details')}
          />
        )}
      </div>
    </div>
  );
}
