import { useState } from 'react';
import { Textarea } from '@/lib/ui/textarea';
import { Button } from '@/lib/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/ui/select';
import { ListsNames, Task } from '@/data-classes/task';
import { useTasksStore } from '@/store/tasksStore';
import { PlusCircle, Star } from 'lucide-react';
import { Label } from '@/lib/ui/label';
import { Checkbox } from '@/lib/ui/checkbox';
import { createInstance } from '@/lib/instance-tools';

export function AddTaskForm() {
  const createTask = useTasksStore((state) => state.createTask);
  const createTaskInput = useTasksStore((state) => state.createTaskInput);
  const setCreateTaskInput = useTasksStore((state) => state.setCreateTaskInput);
  const [selectedList, setSelectedList] = useState('Personal');
  const [isStarred, setIsStarred] = useState(false);

  const addTodo = async () => {
    const todoTexts = createTaskInput.split('\n').filter((text) => text.trim() !== '');
    todoTexts.forEach(async (text) => {
      const newTask = createInstance(Task, {
        name: text,
        list: selectedList,
        selectedAt: isStarred ? new Date() : null,
      });
      await createTask(newTask);
    });
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
        <ListSelect selectedList={selectedList} setSelectedList={setSelectedList} />
        <StarCheckbox isStarred={isStarred} setIsStarred={setIsStarred} />
        <AddTaskButton addTodo={addTodo} />
      </div>
    </div>
  );
}

interface ListSelectProps {
  selectedList: string;
  setSelectedList: (list: string) => void;
}

function ListSelect({ selectedList, setSelectedList }: ListSelectProps) {
  return (
    <div className="flex w-40">
      <Select value={selectedList} onValueChange={setSelectedList}>
        <SelectTrigger id="task-list" className="w-full">
          <SelectValue placeholder="Select a list" />
        </SelectTrigger>
        <SelectContent>
          {ListsNames.map((list) => (
            <SelectItem key={list} value={list}>
              {list}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface StarCheckboxProps {
  isStarred: boolean;
  setIsStarred: (checked: boolean) => void;
}

function StarCheckbox({ isStarred, setIsStarred }: StarCheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox id="starred" checked={isStarred} onCheckedChange={(checked) => setIsStarred(checked as boolean)} />
      <Label
        htmlFor="starred"
        className="text-sm font-medium leading-none cursor-pointer select-none flex items-center"
      >
        <Star className="w-4 h-4 mr-1" />
      </Label>
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
