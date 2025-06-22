import { useState, useEffect } from 'react';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { Plus, PlusCircle, Star, Users } from 'lucide-react';
import { SelectTaskCategory } from './SelectTaskCategory';
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
import { DatePickerButton } from './DatePickerButton';
import { IconButtonToggle } from '@/shared/ui/IconButtonToggle';
import { StatusFilterEnum, useFilterStore } from '@/features/tasks/filter/model/filterStore';
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
    setTaskInput(''); // Optionally reset input text too
    setIsAddTaskOpen(false);
  };

  const taskInput = useAddTasksStore((state) => state.createTaskInput);
  const setTaskInput = useAddTasksStore((state) => state.setCreateTaskInput);

  const [selectedList, setSelectedList] = useState('Personal');
  const [isStarred, setIsStarred] = useState(false);
  const [isBlocker, setIsBlocker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

    const previousInputValue = taskInput;
    setTaskInput('');

    // Create all tasks optimistically at once
    for (const text of todoTexts) {
      const newTask = createInstance(TaskModel, {
        name: text,
        list: selectedList,
        selectedAt: isStarred ? new Date() : null,
        isBlocker,
        date: selectedDate,
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

            <div className="space-y-2">
              <div className="text-sm text-muted-foreground font-medium">Category</div>
              <div className="flex items-center">
                <div className="mr-auto">
                  <SelectTaskCategory selectedList={selectedList} setSelectedList={setSelectedList} />
                </div>

                <div className="flex items-center gap-1">
                  <IconButtonToggle
                    icon={(isChecked) => <Users fill={isChecked ? '#2563eb' : 'none'} className="h-4 w-4" />}
                    tooltipContent="Blocker"
                    isChecked={isBlocker}
                    onCheckedChange={setIsBlocker}
                    className={
                      isBlocker ? 'text-blue-600 hover:text-blue-700' : 'text-muted-foreground hover:text-blue-600'
                    }
                  />
                  <IconButtonToggle
                    icon={(isChecked) => <Star fill={isChecked ? '#E3B644' : 'none'} className="h-4 w-4" />}
                    tooltipContent="Selected"
                    isChecked={isStarred}
                    onCheckedChange={setIsStarred}
                    className={
                      isStarred
                        ? 'text-yellow-500 hover:text-yellow-600'
                        : 'text-muted-foreground hover:text-yellow-500'
                    }
                  />
                  <DatePickerButton selectedDate={selectedDate} onDateChange={setSelectedDate} />
                </div>
              </div>
            </div>
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
