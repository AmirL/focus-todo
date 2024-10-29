'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Star, Clock, RotateCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isFuture, isSameDay, parseISO } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { plainToInstance } from 'class-transformer';
import dayjs from 'dayjs';
import { apiRequest } from './api';
import { Task } from '@/classes/task';
import { useTasksStore } from '@/store/tasksStore';
import { TaskRow } from './Task';

export const FIELDS = {
  name: 'field_2869962',
  details: 'field_2869964',
  date: 'field_2869965',
  completed_at: 'field_2872650',
  list: 'field_2872651',
};

const lists = ['Work', 'Personal', 'Other'];

export function BaserowTodoList() {
  const [newTodo, setNewTodo] = useState('');
  const [selectedList, setSelectedList] = useState('Personal');
  const [filter, setFilter] = useState('All');

  const { fetchTasks, tasks, createTask, updateTask, deleteTask, error, isLoading } = useTasksStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTodo = async () => {
    const todoTexts = newTodo.split('\n').filter((text) => text.trim() !== '');
    todoTexts.forEach(async (text) => {
      const newTask = Object.assign(new Task(), { name: text, list: selectedList });
      await createTask(newTask);
    });
    setNewTodo('');
  };

  const toggleCompleted = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    updateTask(id, { completedAt: new Date().toISOString() });
  };

  const reAddTask = async (id: string) => {
    const taskToRedo = tasks.find((todo) => todo.id === id);
    if (!taskToRedo) return;

    const newTask: Task = Object.assign(new Task(), { ...taskToRedo, id: undefined, completedAt: null, date: null });
    createTask(newTask);

    updateTask(id, { completedAt: new Date().toISOString() });
  };

  const toggleTodayTask = (id: string) => {
    const todo = tasks.find((t) => t.id === id);
    if (!todo) return;

    const date = dayjs(todo.date).isBefore(dayjs()) ? null : new Date().toISOString();
    updateTask(id, { date });
  };

  const snoozeTodo = (id: string, date: Date) => {
    const task = tasks.find((todo) => todo.id === id);
    if (!task) return;

    task.date = date.toISOString();
    updateTask(id, { date: date.toISOString() });
  };

  const filteredTasks = tasks.filter((todo) => {
    const today = new Date();
    if (filter === 'All') return !todo.date || !isFuture(parseISO(todo.date));
    if (filter === 'Today') return todo.date && isSameDay(parseISO(todo.date), today);
    if (filter === 'Future') return todo.date && isFuture(parseISO(todo.date));
    return todo.list === filter && (!todo.date || !isFuture(parseISO(todo.date)));
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 bg-background">
      <h1 className="text-2xl font-bold mb-4 text-primary">Baserow Todo List</h1>
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
              {lists.map((list) => (
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
      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant={filter === 'All' ? 'default' : 'outline'} onClick={() => setFilter('All')}>
          All
        </Button>
        <Button variant={filter === 'Today' ? 'default' : 'outline'} onClick={() => setFilter('Today')}>
          Today
        </Button>
        <Button variant={filter === 'Future' ? 'default' : 'outline'} onClick={() => setFilter('Future')}>
          Future
        </Button>
        {lists.map((list) => (
          <Button key={list} variant={filter === list ? 'default' : 'outline'} onClick={() => setFilter(list)}>
            {list}
          </Button>
        ))}
      </div>
      {filteredTasks.length === 0 ? (
        isLoading ? (
          <div className="flex justify-center items-center h-5">Loading...</div>
        ) : (
          <p className="text-center text-muted-foreground">No tasks found.</p>
        )
      ) : (
        <ul className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
}
