'use client';
import { AddTaskForm } from '@/_pages/tasks-todo/ui/AddTaskForm';
import { Filters } from '@/_pages/tasks-todo/ui/Filters';
import { Goals } from '@/_pages/tasks-todo/ui/Goals';
import { Tasks } from '@/_pages/tasks-todo/ui/Tasks';
import { useUser } from '@auth0/nextjs-auth0/client';

export function TodoList() {
  const { user, error, isLoading } = useUser();

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
      <Goals />
      <Filters />
      <Tasks />
      <Filters />
      <AddTaskForm />
    </>
  );
}
