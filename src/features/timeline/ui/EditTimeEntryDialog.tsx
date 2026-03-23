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
import { Trash2, Save, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { SelectTaskCategory } from '@/shared/ui/task/SelectTaskCategory';
import {
  formatTimeInput,
  formatGapDuration,
  computeGapDuration,
} from '../lib/gapDialogUtils';
import type { TimelineBlock } from '@/shared/ui/timeline';

export interface DayTask {
  id: string;
  name: string;
}

interface EditTimeEntryDialogProps {
  block: (TimelineBlock & { taskId: string; listId: number | null }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  dayTasks: DayTask[];
  onSave: (data: { startedAt: string; endedAt: string; taskId?: number; taskName?: string; listId?: number }) => void;
  onDelete: () => void;
}

export function EditTimeEntryDialog({
  block,
  open,
  onOpenChange,
  date,
  dayTasks,
  onSave,
  onDelete,
}: EditTimeEntryDialogProps) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && block) {
      setStartTime(formatTimeInput(block.startedAt));
      setEndTime(block.endedAt ? formatTimeInput(block.endedAt) : '');
      setTaskInput(block.taskName);
      setSelectedTaskId(block.taskId);
      setSelectedListId(block.listId);
      setDropdownOpen(false);
    }
  }, [open, block]);

  const computedDuration = computeGapDuration(startTime, endTime, date);

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

  const handleSave = () => {
    if (!block || !startTime || !endTime) return;

    const dateStr = date.toISOString().split('T')[0];
    const startedAt = new Date(`${dateStr}T${startTime}:00`).toISOString();
    const endedAt = new Date(`${dateStr}T${endTime}:00`).toISOString();

    const data: { startedAt: string; endedAt: string; taskId?: number; taskName?: string; listId?: number } = {
      startedAt,
      endedAt,
    };

    if (selectedTaskId) {
      data.taskId = Number(selectedTaskId);
    } else if (taskInput.trim() && taskInput.trim() !== block.taskName) {
      data.taskName = taskInput.trim();
      if (selectedListId) {
        data.listId = selectedListId;
      }
    }

    onSave(data);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete();
    onOpenChange(false);
  };

  const isValid = startTime && endTime && (computedDuration ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-cy="edit-time-entry-dialog">
        <DialogHeader>
          <DialogTitle>Edit Time Entry</DialogTitle>
          <DialogDescription>Update the time entry details.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Task combobox */}
          <div>
            <Label htmlFor="edit-task-name">Task</Label>
            <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <PopoverTrigger asChild>
                <div className="relative mt-1">
                  <Input
                    id="edit-task-name"
                    data-cy="edit-task-input"
                    ref={inputRef}
                    value={taskInput}
                    onChange={(e) => handleTaskInputChange(e.target.value)}

                    placeholder="Task name"
                    autoComplete="off"
                    className="pr-8"
                  />
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </PopoverTrigger>
              {filteredTasks.length > 0 && (
                <PopoverContent
                  className="p-1 w-[var(--radix-popover-trigger-width)]"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <ul data-cy="edit-task-dropdown" className="max-h-48 overflow-y-auto">
                    {filteredTasks.map((task) => (
                      <li key={task.id}>
                        <button
                          type="button"
                          data-cy="edit-task-option"
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

          {/* Category - shown when typing a new task name */}
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

          {/* Time fields */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="edit-start-time">Start</Label>
              <Input
                id="edit-start-time"
                data-cy="edit-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="edit-end-time">End</Label>
              <Input
                id="edit-end-time"
                data-cy="edit-end-time"
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
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            data-cy="edit-delete-button"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid}
              data-cy="edit-save-button"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
