import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListsNames, Task } from '@/classes/task';
import { useTasksStore } from '@/store/tasksStore';

export function AddTaskForm() {
  const { createTask } = useTasksStore();
  const [newTodo, setNewTodo] = useState('');
  const [selectedList, setSelectedList] = useState('Personal');

  const addTodo = async () => {
    const todoTexts = newTodo.split('\n').filter((text) => text.trim() !== '');
    todoTexts.forEach(async (text) => {
      const newTask = Object.assign(new Task(), { name: text, list: selectedList });
      await createTask(newTask);
    });
    setNewTodo('');
  };

  return (
    <div className="space-y-2 mb-4">
      <Textarea
        placeholder="Add a new task"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)}
        className="min-h-[100px]"
      />
      <div className="flex space-x-2">
        <Select value={selectedList} onValueChange={setSelectedList}>
          <SelectTrigger className="w-[180px]">
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
        <Button onClick={addTodo} className="flex-grow">
          Add Task
        </Button>
      </div>
    </div>
  );
}
