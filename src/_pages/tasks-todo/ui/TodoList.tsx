'use client';
import { AddTaskForm } from '@/features/tasks/add/ui/AddTaskForm';
import { Goals } from '@/_pages/tasks-todo/ui/Goals';
import { Tasks } from '@/_pages/tasks-todo/ui/Tasks';
import { useSession } from '@/shared/lib/auth-client';
import { useFilterStore } from '@/features/tasks/filter/model/filterStore';
import { TaskActions } from './TaskActions';
import { EditTaskModalRoot } from '@/features/tasks/edit/ui/EditTaskModalRoot';
import { Spotlight } from '@/features/tasks/search/ui/Spotlight';

// Loading state component
function LoadingState() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  );
}

// Unauthenticated state component
function UnauthenticatedState() {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="text-muted-foreground">Please login to see your tasks.</div>
    </div>
  );
}

// Status filter header component
function StatusFilterHeader({ statusFilter }: { statusFilter: string }) {
  return (
    <div className="px-2 sm:px-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-primary capitalize">{statusFilter}</h2>
        <div className="ml-auto">
          <Spotlight buttonClassName="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

// Main todo list content component
function TodoListContent({ statusFilter }: { statusFilter: string }) {
  return (
    <div className="space-y-8">
      <Goals />
      <StatusFilterHeader statusFilter={statusFilter} />
      <TaskActions />
      <Tasks />
      <AddTaskForm />
      <EditTaskModalRoot />
    </div>
  );
}

export function TodoList() {
  const { data: session, isPending } = useSession();
  const { statusFilter } = useFilterStore();

  if (isPending) {
    return <LoadingState />;
  }

  if (!session) {
    return <UnauthenticatedState />;
  }

  return <TodoListContent statusFilter={statusFilter} />;
}
