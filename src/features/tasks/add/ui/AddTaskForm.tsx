import { useState, useEffect } from 'react';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { Plus, PlusCircle, Star, Users } from 'lucide-react';
import { SelectTaskCategory } from './SelectTaskCategory';
import { LabeledCheckbox } from './LabeledCheckbox';
import { useAddTasksStore } from '../model/addTaskStore';
import { useTasksStore } from '@/entities/task/model/tasksStore';
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
import { useShallow } from 'zustand/react/shallow';
import { createTaskMutation } from '@/shared/api/createTask.mutation';
import { DatePickerButton } from './DatePickerButton';

export function AddTaskForm() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const handleDialogClose = (open: boolean) => {
    if (open === false) {
      return;
    }
    setIsAddTaskOpen(open);
  };

  const closeDialog = () => {
    setIsAddTaskOpen(false);
  };

  const taskInput = useAddTasksStore((state) => state.createTaskInput);
  const setTaskInput = useAddTasksStore((state) => state.setCreateTaskInput);

  const [selectedList, setSelectedList] = useState('Personal');
  const [isStarred, setIsStarred] = useState(false);
  const [isBlocker, setIsBlocker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const tasksStore = useTasksStore(useShallow((store) => ({ addTask: store.addTask })));

  const handleAddTaskClick = async () => {
    const todoTexts = taskInput.split('\n').filter((text) => text.trim() !== '');

    const previousInputValue = taskInput;
    setTaskInput('');

    const createMultipleTasks = async () => {
      for (const text of todoTexts) {
        const newTask = createInstance(TaskModel, {
          name: text,
          list: selectedList,
          selectedAt: isStarred ? new Date() : null,
          isBlocker,
          date: selectedDate,
        });
        const createdTask = await createTaskMutation(newTask);
        tasksStore.addTask(createdTask);
      }
    };

    createMultipleTasks().catch(() => {
      setTaskInput(previousInputValue);
      setIsAddTaskOpen(true);
    });
    closeDialog();
    setSelectedDate(null);
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

                <div className="flex items-center gap-3">
                  <LabeledCheckbox
                    id="blocker-checkbox"
                    isChecked={isBlocker}
                    setIsChecked={setIsBlocker}
                    label={<Users className="h-4 w-4" />}
                    tooltipContent="Mark as Blocker"
                    iconOnly={true}
                  />
                  <LabeledCheckbox
                    id="starred-checkbox"
                    isChecked={isStarred}
                    setIsChecked={setIsStarred}
                    label={<Star className="h-4 w-4" />}
                    tooltipContent="Mark as Starred (Selected)"
                    iconOnly={true}
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
