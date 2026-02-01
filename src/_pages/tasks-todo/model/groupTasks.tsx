import type { TaskModel } from '@/entities/task/model/task';
import { useListsQuery } from '@/shared/api/lists';

export type TaskGroup = {
  name: string;
  tasks: TaskModel[];
};

type UseGroupedTasksOptions = {
  focusListName?: string | null;
};

// Groups tasks by their `list` and sorts groups according to the lists order from the sidebar.
// If focusListName is provided, that list's group will appear first.
export function useGroupedTasksByList(
  tasks: TaskModel[],
  options: UseGroupedTasksOptions = {}
): TaskGroup[] {
  const { data: lists = [] } = useListsQuery();
  const { focusListName } = options;

  // Build groups map
  const groupsMap = tasks.reduce<Record<string, TaskModel[]>>((acc, task) => {
    if (!acc[task.list]) acc[task.list] = [];
    acc[task.list].push(task);
    return acc;
  }, {});

  // Sort group names using sidebar order; fallback to alphabetical
  // If focusListName is provided, prioritize it first
  const orderIndex = new Map(lists.map((l, i) => [l.name, i] as const));
  const names = Object.keys(groupsMap).sort((a, b) => {
    // Focus list always comes first
    if (focusListName) {
      if (a === focusListName) return -1;
      if (b === focusListName) return 1;
    }

    const ia = orderIndex.get(a);
    const ib = orderIndex.get(b);
    if (ia != null && ib != null) return ia - ib;
    if (ia != null) return -1;
    if (ib != null) return 1;
    return a.localeCompare(b);
  });

  return names.map((name) => ({ name, tasks: groupsMap[name] }));
}

