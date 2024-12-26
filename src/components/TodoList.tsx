'use client';

import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTasksStore } from '@/store/tasksStore';
import { TaskRow } from './Task';
import { AddTaskForm } from './AddTaskForm';
import { Filters, useApplyFilters } from './Filters';
import { Task } from '@/data-classes/task';
import { useUser } from '@auth0/nextjs-auth0/client';

export function TodoList() {
  const { user, error, isLoading } = useUser();

  const fetchTasks = useTasksStore((state) => state.fetchTasks);
  const allTasks = useTasksStore((state) => state.tasks);

  const tasks = useApplyFilters(allTasks);

  useEffect(() => {
    if (tasks.length === 0) fetchTasks();
  }, [fetchTasks, tasks.length]);

  const hasTasks = tasks.length > 0;

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
      <Filters />
      <ErrorMessagesArea />
      {hasTasks ? <Tasks tasks={tasks} /> : <EmptyList />}
      <Filters />
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
  console.log('Rendering tasks');
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
