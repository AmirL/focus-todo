'use client';

import { useState, useEffect } from 'react';
import { isFuture, isSameDay, parseISO } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTasksStore } from '@/store/tasksStore';
import { TaskRow } from './Task';
import { AddTaskForm } from './AddTaskForm';
import { Filters } from './Filters';

export const FIELDS = {
  name: 'field_2869962',
  details: 'field_2869964',
  date: 'field_2869965',
  completed_at: 'field_2872650',
  list: 'field_2872651',
};

export function TodoList() {
  const [filter, setFilter] = useState('All');

  const { fetchTasks, tasks, error, isLoading } = useTasksStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
      <AddTaskForm />
      <Filters filter={filter} setFilter={setFilter} />
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
