'use client';
import { AddTaskForm } from '@/features/tasks/add/ui/AddTaskForm';
import { Goals } from '@/_pages/tasks-todo/ui/Goals';
import { Tasks } from '@/_pages/tasks-todo/ui/Tasks';
import { useSession } from '@/shared/lib/auth-client';
import { useFilterStore } from '@/features/tasks/filter/model/filterStore';
import { TaskActions } from './TaskActions';

export function TodoList() {
  const { data: session, isPending } = useSession();
  const { statusFilter } = useFilterStore();

  if (!session) {
    return (
      <div className="flex justify-center items-center h-5">
        {isPending ? 'Loading...' : 'Please login in to see your tasks.'}
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
        <TaskActions />
        <Tasks />
        <AddTaskForm />
      </div>
    </>
  );
}
