import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Slider } from '@/shared/ui/slider';
import { Textarea } from '@/shared/ui/textarea';

interface GoalFormFieldsProps {
  defaultTitle?: string;
  description: string;
  onDescriptionChange: (value: string) => void;
  progress: number;
  onProgressChange: (value: number) => void;
  dataCyPrefix?: string;
}

export function GoalFormFields({
  defaultTitle,
  description,
  onDescriptionChange,
  progress,
  onProgressChange,
  dataCyPrefix = '',
}: GoalFormFieldsProps) {
  return (
    <div className="grid gap-4 py-2">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={defaultTitle}
          data-cy={`${dataCyPrefix}goal-title-input`}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Describe this goal..."
          className="min-h-[80px]"
          data-cy={`${dataCyPrefix}goal-description-input`}
        />
      </div>
      <div>
        <Label htmlFor="progress">Progress: {progress}%</Label>
        <Slider
          id="progress"
          min={0}
          max={100}
          step={5}
          value={[progress]}
          onValueChange={(value) => onProgressChange(value[0])}
          className="mt-2"
        />
      </div>
    </div>
  );
}
