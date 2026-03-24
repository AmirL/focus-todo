'use client';

import { useState, useEffect, useRef } from 'react';
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
import { PlusCircle, ChevronDown } from 'lucide-react';
import { SelectTaskCategory } from '@/shared/ui/task/SelectTaskCategory';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { useCreateCompletedTaskMutation } from '@/shared/api/tasks';
import type { TimelineGap } from '@/shared/ui/timeline';
import type { DayTask } from './EditTimeEntryDialog';
import {
  formatTimeInput,
  formatGapDuration,
  computeGapDuration,
  buildGapTaskPayload,
  buildTimeRange,
} from '../lib/gapDialogUtils';

interface QuickAddFromGapDialogProps {
  gap: TimelineGap | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayTasks?: DayTask[];
}

export function QuickAddFromGapDialog({ gap, open, onOpenChange, dayTasks = [] }: QuickAddFromGapDialogProps) {
  const [taskInput, setTaskInput] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const createCompletedTask = useCreateCompletedTaskMutation();

  // Pre-fill times when dialog opens with a gap.
  useEffect(() => {
    if (open && gap) {
      setTaskInput('');
      setSelectedTaskId(null);
      setStartTime(formatTimeInput(gap.startedAt));
      setEndTime(formatTimeInput(gap.endedAt));
      setSelectedListId(null);
      setDropdownOpen(false);
    }
  }, [open, gap]);

  const filteredTasks = dayTasks.filter((t) =>
    t.name.toLowerCase().includes(taskInput.toLowerCase()),
  );

  const handleTaskSelect = (task: DayTask) => {
    setTaskInput(task.name);
    setSelectedTaskId(task.id);
    setDropdownOpen(false);
  };

  const handleTaskInputChange = (value: string) => {
    setTaskInput(value);
    setSelectedTaskId(null);
    setDropdownOpen(true);
  };

  const handleSubmit = () => {
    if (!gap || !taskInput.trim()) return;

    const computedDuration = computeGapDuration(startTime, endTime, new Date(gap.startedAt));
    if (!computedDuration) return;

    if (selectedTaskId) {
      // Log time against existing task
      const { startedAt, endedAt } = buildTimeRange(startTime, endTime, new Date(gap.startedAt));
      createCompletedTask.mutate({ taskId: Number(selectedTaskId), startedAt, endedAt });
    } else {
      // Create new task
      if (!selectedListId) return;
      const payload = buildGapTaskPayload(taskInput, selectedListId, startTime, endTime, new Date(gap.startedAt));
      createCompletedTask.mutate(payload);
    }

    onOpenChange(false);
  };

  // Compute duration from current time inputs
  const computedDuration = gap
    ? computeGapDuration(startTime, endTime, new Date(gap.startedAt))
    : null;

  const isValid = taskInput.trim() && computedDuration && (selectedTaskId || selectedListId);

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
          {/* Task combobox */}
          <div>
            <Label htmlFor="gap-task-name">Task name</Label>
            <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <PopoverTrigger asChild>
                <div className="relative mt-1">
                  <Input
                    id="gap-task-name"
                    data-cy="gap-task-name"
                    ref={inputRef}
                    value={taskInput}
                    onChange={(e) => handleTaskInputChange(e.target.value)}
                    placeholder="What were you doing?"
                    autoComplete="off"
                    className="pr-8"
                    autoFocus
                  />
                  {dayTasks.length > 0 && (
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  )}
                </div>
              </PopoverTrigger>
              {filteredTasks.length > 0 && (
                <PopoverContent
                  className="p-1 w-[var(--radix-popover-trigger-width)]"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <ul data-cy="gap-task-dropdown" className="max-h-48 overflow-y-auto">
                    {filteredTasks.map((task) => (
                      <li key={task.id}>
                        <button
                          type="button"
                          data-cy="gap-task-option"
                          className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors"
                          onClick={() => handleTaskSelect(task)}
                        >
                          {task.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              )}
            </Popover>
          </div>

          {/* Category - only shown when typing a new task name (not selecting existing) */}
          {!selectedTaskId && (
            <div>
              <Label>Category</Label>
              <div className="mt-1">
                <SelectTaskCategory
                  selectedListId={selectedListId}
                  setSelectedListId={setSelectedListId}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
            <div className="sm:flex-1">
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
            <div className="sm:flex-1">
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
              <div className="col-span-2 sm:col-span-1 flex items-end sm:pb-1">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatGapDuration(computedDuration)}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-between gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid}
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
