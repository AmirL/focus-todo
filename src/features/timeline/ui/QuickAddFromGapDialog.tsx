'use client';

import { useState } from 'react';
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

interface QuickAddFromGapDialogProps {
  gap: TimelineGap | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatTimeInput(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function parseTimeToDate(timeStr: string, referenceDate: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(referenceDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function QuickAddFromGapDialog({ gap, open, onOpenChange }: QuickAddFromGapDialogProps) {
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const createCompletedTask = useCreateCompletedTaskMutation();

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && gap) {
      // Reset form and pre-fill times from gap
      setName('');
      setStartTime(formatTimeInput(gap.startedAt));
      setEndTime(formatTimeInput(gap.endedAt));
      setSelectedListId(null);
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = () => {
    if (!name.trim() || !selectedListId || !gap) return;

    const referenceDate = new Date(gap.startedAt);
    const startDate = parseTimeToDate(startTime, referenceDate);
    const endDate = parseTimeToDate(endTime, referenceDate);

    if (endDate <= startDate) return;

    createCompletedTask.mutate({
      task: { name: name.trim(), listId: selectedListId },
      startedAt: startDate.toISOString(),
      endedAt: endDate.toISOString(),
    });

    onOpenChange(false);
  };

  // Compute duration from current time inputs
  const computedDuration = (() => {
    if (!startTime || !endTime || !gap) return null;
    const ref = new Date(gap.startedAt);
    const start = parseTimeToDate(startTime, ref);
    const end = parseTimeToDate(endTime, ref);
    const mins = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    return mins > 0 ? mins : null;
  })();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                  {formatDuration(computedDuration)}
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
