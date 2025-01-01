'use client';

import { useEffect } from 'react';
import { useTasksStore } from '@/store/tasksStore';
import { TaskRow } from '../Task';
import { Task } from '@/data-classes/task';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Filters, useApplyFilters } from './Filters';
import { AddTaskForm } from '../Task/AddTaskForm';
import { Button } from '@/lib/ui/button';
import { MainBlock } from './MainBlock';

export function TodoList() {
  const { user, error, isLoading } = useUser();

  const fetchTasks = useTasksStore((state) => state.fetchTasks);
  const allTasks = useTasksStore((state) => state.tasks);

  const tasks = useApplyFilters(allTasks);

  useEffect(() => {
    if (allTasks.length === 0) fetchTasks();
  }, [fetchTasks, allTasks.length]);

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
      {/* <Actions tasks={tasks} /> */}
      <Filters />
      <Tasks tasks={tasks} />
    </>
  );
}

// function Actions({ tasks }: { tasks: Task[] }) {
//   const hasSelectedTasks = tasks.some((task) => task.starred);
//   const hasCompletedTasks = tasks.some((task) => task.completedAt);

//   if (!hasSelectedTasks && !hasCompletedTasks) {
//     return null;
//   }

//   return (
//     <MainBlock title="Actions">
//       <div className="flex gap-2 ">
//         <ClearSelectedButton />
//         <ClearCompletedButton />
//       </div>
//     </MainBlock>
//   );
// }

// function ClearSelectedButton() {
//   const clearSelectedTasks = useTasksStore((state) => state.clearSelectedTasks);
//   return (
//     <Button onClick={clearSelectedTasks} variant="outline">
//       Clear selected
//     </Button>
//   );
// }

// function ClearCompletedButton() {
//   const clearCompletedTasks = useTasksStore((state) => state.clearCompletedTasks);
//   return (
//     <Button onClick={clearCompletedTasks} variant="outline">
//       Clear completed
//     </Button>
//   );
// }

function Tasks({ tasks }: { tasks: Task[] }) {
  const isLoading = useTasksStore((state) => state.isLoading);

  if (isLoading) {
    return <div className="flex justify-center items-center h-5">Loading...</div>;
  }

  if (tasks.length === 0) {
    return <p className="text-center text-muted-foreground">No tasks found.</p>;
  }

  console.log('Rendering tasks');
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </ul>
  );
}
