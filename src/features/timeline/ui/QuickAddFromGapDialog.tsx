'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { PlusCircle } from 'lucide-react';
import { SelectTaskCategory } from '@/shared/ui/task/SelectTaskCategory';
import { useCreateCompletedTaskMutation } from '@/shared/api/tasks';
import type { TimelineGap } from '@/shared/ui/timeline';
import {
  formatTimeInput,
  formatGapDuration,
  computeGapDuration,
  isValidGapSubmission,
  buildGapTaskPayload,
} from '../lib/gapDialogUtils';

interface QuickAddFromGapDialogProps {
  gap: TimelineGap | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddFromGapDialog({ gap, open, onOpenChange }: QuickAddFromGapDialogProps) {
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const createCompletedTask = useCreateCompletedTaskMutation();

  // Pre-fill times when dialog opens with a gap.
  // Radix Dialog does not call onOpenChange when opened via the `open` prop,
  // so we use an effect instead of relying on onOpenChange for initialization.
  useEffect(() => {
    if (open && gap) {
      setName('');
      setStartTime(formatTimeInput(gap.startedAt));
      setEndTime(formatTimeInput(gap.endedAt));
      setSelectedListId(null);
    }
  }, [open, gap]);

  const handleSubmit = () => {
    if (!gap || !isValidGapSubmission(name, selectedListId, startTime, endTime, new Date(gap.startedAt))) return;

    const payload = buildGapTaskPayload(name, selectedListId!, startTime, endTime, new Date(gap.startedAt));
    createCompletedTask.mutate(payload);
    onOpenChange(false);
  };

  // Compute duration from current time inputs
  const computedDuration = gap
    ? computeGapDuration(startTime, endTime, new Date(gap.startedAt))
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-cy="quick-add-gap-dialog">
        <DialogHeader>
          <DialogTitle>Log Task</DialogTitle>
          <DialogDescription>
            Fill in what you were doing during this gap.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="gap-task-name">Task name</Label>
            <Input
              id="gap-task-name"
              data-cy="gap-task-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What were you doing?"
              className="mt-1"
              autoFocus
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="gap-start-time">Start</Label>
              <Input
                id="gap-start-time"
                data-cy="gap-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="gap-end-time">End</Label>
              <Input
                id="gap-end-time"
                data-cy="gap-end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1"
              />
            </div>
            {computedDuration && (
              <div className="flex items-end pb-1">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatGapDuration(computedDuration)}
                </span>
              </div>
            )}
          </div>

          <div>
            <Label>Category</Label>
            <div className="mt-1">
              <SelectTaskCategory
                selectedListId={selectedListId}
                setSelectedListId={setSelectedListId}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !selectedListId || !computedDuration}
            data-cy="gap-submit-button"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Log Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
