'use client';

import { useState, useEffect } from 'react';
import { isFuture, isSameDay, parseISO } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTasksStore } from '@/store/tasksStore';
import { TaskRow } from './Task';
import { AddTaskForm } from './AddTaskForm';
import { Filters } from './Filters';
import { Task } from '@/classes/task';

export function TodoList() {
  const [filter, setFilter] = useState('All');

  const { fetchTasks, tasks } = useTasksStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((todo) => {
    const today = new Date();
    if (filter === 'All') return !todo.date || !isFuture(parseISO(todo.date));
    if (filter === 'Today') return todo.date && isSameDay(parseISO(todo.date), today);
    if (filter === 'Future') return todo.date && isFuture(parseISO(todo.date));
    return todo.list === filter && (!todo.date || !isFuture(parseISO(todo.date)));
  });

  const hasTasks = filteredTasks.length > 0;

  return (
    <div className="max-w-xl mx-auto p-4 bg-background">
      <h1 className="text-2xl font-bold mb-4 text-primary">Zero Resistance Todo List</h1>
      <ErrorMessagesArea />
      <AddTaskForm />
      <Filters filter={filter} setFilter={setFilter} />
      {hasTasks ? <Tasks tasks={filteredTasks} /> : <EmptyList />}
    </div>
  );
}

function ErrorMessagesArea() {
  const { error } = useTasksStore();

  if (!error) return <></>;
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

function Tasks({ tasks }: { tasks: Task[] }) {
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </ul>
  );
}

function EmptyList() {
  const { isLoading } = useTasksStore();

  if (isLoading) return <div className="flex justify-center items-center h-5">Loading...</div>;

  return <p className="text-center text-muted-foreground">No tasks found.</p>;
}
