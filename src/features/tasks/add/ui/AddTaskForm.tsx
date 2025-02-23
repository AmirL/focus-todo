import { useState } from 'react';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { PlusCircle } from 'lucide-react';
import { Label } from '@/shared/ui/label';
import { SelectTaskCategory } from './SelectTaskCategory';
import { StarCheckbox } from './StarCheckbox';
import { useAddTasksStore } from '../model/addTaskStore';
import { useTasksStore } from '@/shared/model/tasksStore';

export function AddTaskForm() {
  const createTasks = useTasksStore((store) => store.createMultipleTasks);

  const createTaskInput = useAddTasksStore((state) => state.createTaskInput);
  const setCreateTaskInput = useAddTasksStore((state) => state.setCreateTaskInput);

  const [selectedList, setSelectedList] = useState('Personal');
  const [isStarred, setIsStarred] = useState(false);

  const addTodo = async () => {
    const todoTexts = createTaskInput.split('\n').filter((text) => text.trim() !== '');

    const previousInputValue = createTaskInput;

    setCreateTaskInput('');
    createTasks(todoTexts, selectedList, isStarred).catch(() => setCreateTaskInput(previousInputValue));
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="new-task" className="text-lg font-semibold block">
        Add a New Task
      </Label>
      <Textarea
        id="new-task"
        placeholder="Enter your task here..."
        value={createTaskInput}
        onChange={(e) => setCreateTaskInput(e.target.value)}
        className="min-h-[100px]"
      />
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <SelectTaskCategory selectedList={selectedList} setSelectedList={setSelectedList} />
        <StarCheckbox isStarred={isStarred} setIsStarred={setIsStarred} />
        <AddTaskButton addTodo={addTodo} />
      </div>
    </div>
  );
}

interface AddTaskButtonProps {
  addTodo: () => void;
}

function AddTaskButton({ addTodo }: AddTaskButtonProps) {
  return (
    <Button onClick={addTodo} className="flex-grow">
      <PlusCircle className="w-4 h-4 mr-2" />
      Add Task
    </Button>
  );
}
