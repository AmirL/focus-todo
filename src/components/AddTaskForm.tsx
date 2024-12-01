import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListsNames, Task } from '@/classes/task';
import { useTasksStore } from '@/store/tasksStore';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { PlusCircle, Star } from 'lucide-react';

export function AddTaskForm() {
  const { createTask } = useTasksStore();
  const [newTodo, setNewTodo] = useState('');
  const [selectedList, setSelectedList] = useState('Personal');
  const [isStarred, setIsStarred] = useState(false);

  const addTodo = async () => {
    const todoTexts = newTodo.split('\n').filter((text) => text.trim() !== '');
    todoTexts.forEach(async (text) => {
      const newTask = Task.create({ name: text, list: selectedList, starred: isStarred });
      await createTask(newTask);
    });
    setNewTodo('');
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="new-task" className="text-lg font-semibold block">
        Add a New Task
      </Label>
      <Textarea
        id="new-task"
        placeholder="Enter your task here..."
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
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
