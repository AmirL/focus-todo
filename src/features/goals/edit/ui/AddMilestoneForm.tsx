import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Slider } from '@/shared/ui/slider';
import { Textarea } from '@/shared/ui/textarea';
import { useCreateMilestoneMutation } from '@/shared/api/goal-milestones';

export function AddMilestoneForm({
  goalId,
  currentProgress,
  onMilestoneAdded,
}: {
  goalId: string;
  currentProgress: number;
  onMilestoneAdded: (newProgress: number) => void;
}) {
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState(currentProgress);
  const createMilestoneMutation = useCreateMilestoneMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    createMilestoneMutation.mutate(
      { goalId, progress, description: description.trim() },
      {
        onSuccess: () => {
          onMilestoneAdded(progress);
          setDescription('');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="milestone-description">Add milestone</Label>
        <Textarea
          id="milestone-description"
          placeholder="What progress did you make?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1"
          rows={2}
          data-cy="milestone-description-input"
        />
      </div>
      <div>
        <Label>Progress: {progress}%</Label>
        <Slider
          min={0}
          max={100}
          step={5}
          value={[progress]}
          onValueChange={(value) => setProgress(value[0])}
          className="mt-2"
          data-cy="milestone-progress-slider"
        />
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={!description.trim() || createMilestoneMutation.isPending}
        data-cy="add-milestone-button"
      >
        Add Milestone
      </Button>
    </form>
  );
}
