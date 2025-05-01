'use client';
import { AddTaskForm } from '@/features/tasks/add/ui/AddTaskForm';
import { Goals } from '@/_pages/tasks-todo/ui/Goals';
import { Tasks } from '@/_pages/tasks-todo/ui/Tasks';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useFilterStore } from '@/_pages/tasks-todo/model/filterStore';
import { cn } from '@/shared/lib/utils';

export function TodoList() {
  const { user, error, isLoading } = useUser();
  const { statusFilter } = useFilterStore();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-5">
        {isLoading ? 'Loading...' : 'Please login in to see your tasks.'}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <Goals />
        <div className="px-2 sm:px-4">
          <h2 className="text-lg font-semibold text-primary flex items-center gap-2 capitalize">{statusFilter}</h2>
        </div>
        <Tasks />
        <AddTaskForm />
      </div>
    </>
  );
}
