'use client';

import { useState, useEffect } from 'react';
import { isFuture, parseISO } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTasksStore } from '@/store/tasksStore';
import { TaskRow } from './Task';
import { AddTaskForm } from './AddTaskForm';
import { Filters } from './Filters';
import { Task } from '@/classes/task';
import { useUser } from '@auth0/nextjs-auth0/client';

export function TodoList() {
  const { user, error, isLoading } = useUser();
  const [filter, setFilter] = useState('All');

  const { fetchTasks, tasks } = useTasksStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((todo) => {
    // const today = new Date();
    if (filter === 'All') return !todo.date || !isFuture(parseISO(todo.date));
    if (filter === 'Selected') return todo.selected;
    if (filter === 'Future') return todo.date && isFuture(parseISO(todo.date));
    return todo.list === filter && (!todo.date || !isFuture(parseISO(todo.date)));
  });

  const hasTasks = filteredTasks.length > 0;

  if (!user) {
    return (
      <div className="flex justify-center items-center h-5">
        {isLoading ? 'Loading...' : 'Please login in to see your tasks.'}
      </div>
    );
  }

  return (
    <>
      <AddTaskForm />
      <Filters filter={filter} setFilter={setFilter} />
      <ErrorMessagesArea />
      {hasTasks ? <Tasks tasks={filteredTasks} /> : <EmptyList />}
      <Filters filter={filter} setFilter={setFilter} />
      <AddTaskForm />
    </>
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
