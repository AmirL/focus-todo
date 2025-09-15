import type { TaskModel } from '@/entities/task/model/task';
import { useListsQuery } from '@/shared/api/lists';

export type TaskGroup = {
  name: string;
  tasks: TaskModel[];
};

// Groups tasks by their `list` and sorts groups according to the lists order from the sidebar.
export function useGroupedTasksByList(tasks: TaskModel[]): TaskGroup[] {
  const { data: lists = [] } = useListsQuery();

  // Build groups map
  const groupsMap = tasks.reduce<Record<string, TaskModel[]>>((acc, task) => {
    if (!acc[task.list]) acc[task.list] = [];
    acc[task.list].push(task);
    return acc;
  }, {});

  // Sort group names using sidebar order; fallback to alphabetical
  const orderIndex = new Map(lists.map((l, i) => [l.name, i] as const));
  const names = Object.keys(groupsMap).sort((a, b) => {
    const ia = orderIndex.get(a);
    const ib = orderIndex.get(b);
    if (ia != null && ib != null) return ia - ib;
    if (ia != null) return -1;
    if (ib != null) return 1;
    return a.localeCompare(b);
  });

  return names.map((name) => ({ name, tasks: groupsMap[name] }));
}

