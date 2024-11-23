'use client';

import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTasksStore } from '@/store/tasksStore';
import { TaskRow } from './Task';
import { AddTaskForm } from './AddTaskForm';
import { Filters } from './Filters';
import { Task } from '@/classes/task';
import { useUser } from '@auth0/nextjs-auth0/client';
import { SpecialFilter, useFilterStore } from '@/store/filterStore';
import dayjs from 'dayjs';
import { isFutureDate } from '@/lib/utils';

export function TodoList() {
  const { user, error, isLoading } = useUser();

  const { fetchTasks, tasks } = useTasksStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  const { specialFilter, list } = useFilterStore();

  const filteredTasks = applySpecialFilter(tasks, specialFilter);
  const filteredTasksByList = applyListFilter(filteredTasks, list);

  const hasTasks = filteredTasksByList.length > 0;

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
      {hasTasks ? <Tasks tasks={filteredTasksByList} /> : <EmptyList />}
      <Filters />
      <AddTaskForm />
    </>
  );
}

function applySpecialFilter(tasks: Task[], filter: SpecialFilter) {
  if (filter === 'future') return tasks.filter((task) => isFutureDate(task.date));

  const withoutFutureTasks = tasks.filter((task) => !isFutureDate(task.date));
  if (filter === 'all') return withoutFutureTasks;
  if (filter === 'selected') return withoutFutureTasks.filter((task) => task.selected);
  return withoutFutureTasks;
}

function applyListFilter(tasks: Task[], filter: string) {
  if (!filter) return tasks;
  return tasks.filter((task) => task.list === filter);
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
