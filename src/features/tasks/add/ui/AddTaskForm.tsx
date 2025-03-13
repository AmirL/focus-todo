import { useState } from 'react';
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

export function AddTaskForm() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const handleDialogClose = (open: boolean) => {
    setIsAddTaskOpen(open);
  };

  const taskInput = useAddTasksStore((state) => state.createTaskInput);
  const setTaskInput = useAddTasksStore((state) => state.setCreateTaskInput);

  const [selectedList, setSelectedList] = useState('Personal');
  const [isStarred, setIsStarred] = useState(false);
  const [isDependency, setIsDependency] = useState(false);

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
          isDependency,
        });
        const createdTask = await createTaskMutation(newTask);
        tasksStore.addTask(createdTask);
      }
    };

    createMultipleTasks().catch(() => {
      setTaskInput(previousInputValue);
      setIsAddTaskOpen(true);
    });
    setIsAddTaskOpen(false);
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

          <div className="flex items-center gap-4">
            <SelectTaskCategory selectedList={selectedList} setSelectedList={setSelectedList} />
            <LabeledCheckbox
              isChecked={isDependency}
              setIsChecked={setIsDependency}
              label={
                <>
                  <Users className="h-4 w-4 mr-1" /> Dependency
                </>
              }
            />
            <LabeledCheckbox
              isChecked={isStarred}
              setIsChecked={setIsStarred}
              label={
                <>
                  <Star className="h-4 w-4 mr-1" /> Star
                </>
              }
            />
          </div>
        </div>

        <DialogFooterButtons
          onCancel={() => setIsAddTaskOpen(false)}
          onAdd={handleAddTaskClick}
          isAddDisabled={!taskInput.trim()}
        />
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
