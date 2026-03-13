import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Plus, PlusCircle } from 'lucide-react';
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
import { useEditTaskModalStore } from '@/features/tasks/edit';
import { StatusFilterEnum, useFilterStore } from '@/features/tasks/filter';
import { TaskFormFields } from '@/shared/ui/task/TaskFormFields';
import { useTaskMetadata } from '@/shared/ui/task/useTaskMetadata';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export function AddTaskForm() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const createTaskMutation = useCreateTaskMutation({
    onSuccess: (createdTask) => {
      toast.success(
        (t) => (
          <span className="flex items-center gap-2">
            Task created: {createdTask.name}
            <button
              onClick={() => {
                useEditTaskModalStore.getState().openWithTask(createdTask);
                toast.dismiss(t.id);
              }}
              className="ml-2 text-blue-600 underline hover:text-blue-800"
            >
              Edit
            </button>
          </span>
        ),
        { duration: 5000 }
      );
    },
  });

  const { metadata, updateMetadata, resetMetadata } = useTaskMetadata();
  const { statusFilter, listId } = useFilterStore();

  const resetForm = () => {
    setName('');
    setDetails('');
    resetMetadata();
  };

  const handleDialogClose = (open: boolean) => {
    if (open === false) {
      resetForm();
    }
    setIsAddTaskOpen(open);
  };

  const closeDialog = () => {
    resetForm();
    setIsAddTaskOpen(false);
  };

  useEffect(() => {
    if (isAddTaskOpen) {
      resetForm();

      // Apply status-based defaults
      switch (statusFilter) {
        case StatusFilterEnum.TODAY:
          updateMetadata({ selectedDate: new Date() });
          break;
        case StatusFilterEnum.TOMORROW:
          updateMetadata({ selectedDate: dayjs().add(1, 'day').toDate() });
          break;
        case StatusFilterEnum.SELECTED:
          updateMetadata({ isStarred: true });
          break;
      }

      // Apply list filter default, if any
      if (listId) {
        updateMetadata({ selectedListId: Number(listId) });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAddTaskOpen, statusFilter, listId]);

  const handleAddTaskClick = () => {
    if (!name.trim()) return;

    const newTask = createInstance(TaskModel, {
      name: name.trim(),
      details: details.trim(),
      listId: metadata.selectedListId!,
      selectedAt: metadata.isStarred ? new Date() : null,
      isBlocker: metadata.isBlocker,
      date: metadata.selectedDate,
      estimatedDuration: metadata.selectedDuration,
      goalId: metadata.selectedGoalId,
    });
    createTaskMutation.mutate(newTask);
    setIsAddTaskOpen(false);
  };

  return (
    <Dialog open={isAddTaskOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsAddTaskOpen(true)}
          data-cy="add-task-button"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>Create a new task for your todo list.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <TaskFormFields
            name={name}
            onNameChange={setName}
            details={details}
            onDetailsChange={setDetails}
            metadata={metadata}
            onMetadataChange={updateMetadata}
          />
        </div>

        <DialogFooterButtons onCancel={closeDialog} onAdd={handleAddTaskClick} isAddDisabled={!name.trim()} />
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
      <Button onClick={onAdd} disabled={isAddDisabled} data-cy="save-task-button">
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Task
      </Button>
    </DialogFooter>
  );
}
