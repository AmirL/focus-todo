import { useState, useEffect } from 'react';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { Plus, PlusCircle } from 'lucide-react';
import { useAddTasksStore } from '../model/addTaskStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { createInstance } from '@/shared/lib/instance-tools';
import { TaskModel } from '@/entities/task/model/task';
import { useCreateTaskMutation } from '@/shared/api/tasks';
import { StatusFilterEnum, useFilterStore } from '@/features/tasks/filter/model/filterStore';
import { TaskMetadataFields } from '@/shared/ui/task/TaskMetadataFields';
import dayjs from 'dayjs';

export function AddTaskForm() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const createTaskMutation = useCreateTaskMutation();

  const handleDialogClose = (open: boolean) => {
    if (open === false) {
      // Reset states when dialog closes
      setSelectedList('Personal');
      setIsStarred(false);
      setIsBlocker(false);
      setSelectedDate(null);
      setSelectedDuration(null);
      setTaskInput(''); // Optionally reset input text too
    }
    setIsAddTaskOpen(open);
  };

  const closeDialog = () => {
    // Reset states when dialog is explicitly closed
    setSelectedList('Personal');
    setIsStarred(false);
    setIsBlocker(false);
    setSelectedDate(null);
    setSelectedDuration(null);
    setTaskInput(''); // Optionally reset input text too
    setIsAddTaskOpen(false);
  };

  const taskInput = useAddTasksStore((state) => state.createTaskInput);
  const setTaskInput = useAddTasksStore((state) => state.setCreateTaskInput);

  const [selectedList, setSelectedList] = useState('Personal');
  const [isStarred, setIsStarred] = useState(false);
  const [isBlocker, setIsBlocker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const { statusFilter } = useFilterStore();

  useEffect(() => {
    if (isAddTaskOpen) {
      // Reset to defaults first
      setSelectedDate(null);
      setIsStarred(false);

      // Apply filter-based defaults
      switch (statusFilter) {
        case StatusFilterEnum.TODAY:
          setSelectedDate(new Date());
          break;
        case StatusFilterEnum.TOMORROW:
          setSelectedDate(dayjs().add(1, 'day').toDate());
          break;
        case StatusFilterEnum.SELECTED:
          setIsStarred(true);
          break;
      }
    }
  }, [isAddTaskOpen, statusFilter]); // Rerun effect if dialog opens or filter changes while open

  const handleAddTaskClick = async () => {
    const todoTexts = taskInput.split('\n').filter((text) => text.trim() !== '');

    setTaskInput('');

    // Create all tasks sequentially
    for (const text of todoTexts) {
      const newTask = createInstance(TaskModel, {
        name: text,
        list: selectedList,
        selectedAt: isStarred ? new Date() : null,
        isBlocker,
        date: selectedDate,
        estimatedDuration: selectedDuration,
      });
      createTaskMutation.mutate(newTask);
    }
    // Don't close dialog immediately on click, wait for API response (or handle errors)
    // closeDialog();
    // setSelectedDate(null); // Resetting is handled by closeDialog now
    setIsAddTaskOpen(false); // Close dialog after processing
  };

  return (
    <Dialog open={isAddTaskOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsAddTaskOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div
          className="w-full"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeDialog();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a new task for your todo list.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              id="new-task"
              placeholder="Enter your task here..."
              className="min-h-[100px] resize-none"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              autoFocus
            />

            <TaskMetadataFields
              selectedDuration={selectedDuration}
              onDurationChange={setSelectedDuration}
              selectedList={selectedList}
              onListChange={setSelectedList}
              isStarred={isStarred}
              onStarredChange={setIsStarred}
              isBlocker={isBlocker}
              onBlockerChange={setIsBlocker}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>
        </div>

        <DialogFooterButtons onCancel={closeDialog} onAdd={handleAddTaskClick} isAddDisabled={!taskInput.trim()} />
      </DialogContent>
    </Dialog>
  );
}

interface DialogFooterButtonsProps {
  onCancel: () => void;
  onAdd: () => void;
  isAddDisabled: boolean;
}

function DialogFooterButtons({ onCancel, onAdd, isAddDisabled }: DialogFooterButtonsProps) {
  return (
    <DialogFooter className="flex sm:justify-between">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onAdd} disabled={isAddDisabled}>
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Task
      </Button>
    </DialogFooter>
  );
}
