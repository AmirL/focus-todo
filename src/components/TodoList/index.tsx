'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Filters } from './Filters';
import { AddTaskForm } from '../Task/AddTaskForm';
import { Tasks } from './Tasks';
import { Goals } from './Goals';

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
