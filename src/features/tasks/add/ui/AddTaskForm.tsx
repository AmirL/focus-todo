import { useState } from 'react';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { Plus, PlusCircle } from 'lucide-react';
import { SelectTaskCategory } from './SelectTaskCategory';
import { StarCheckbox } from './StarCheckbox';
import { useAddTasksStore } from '../model/addTaskStore';
import { useTasksStore } from '@/shared/model/tasksStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';

export function AddTaskForm() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const handleDialogClose = (open: boolean) => {
    setIsAddTaskOpen(open);
  };

  const createTasks = useTasksStore((store) => store.createMultipleTasks);

  const createTaskInput = useAddTasksStore((state) => state.createTaskInput);
  const setCreateTaskInput = useAddTasksStore((state) => state.setCreateTaskInput);

  const [selectedList, setSelectedList] = useState('Personal');
  const [isStarred, setIsStarred] = useState(false);

  const addTodo = async () => {
    const todoTexts = createTaskInput.split('\n').filter((text) => text.trim() !== '');

    const previousInputValue = createTaskInput;

    setCreateTaskInput('');
    createTasks(todoTexts, selectedList, isStarred).catch(() => {
      setCreateTaskInput(previousInputValue);
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
            value={createTaskInput}
            onChange={(e) => setCreateTaskInput(e.target.value)}
            autoFocus
          />

          <div className="flex items-center gap-4">
            <SelectTaskCategory selectedList={selectedList} setSelectedList={setSelectedList} />
            <StarCheckbox isStarred={isStarred} setIsStarred={setIsStarred} />
          </div>
        </div>

        <DialogFooterButtons
          onCancel={() => setIsAddTaskOpen(false)}
          onAdd={addTodo}
          isAddDisabled={!createTaskInput.trim()}
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
